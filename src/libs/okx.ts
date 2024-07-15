import { okx, Transaction } from "ccxt";
import conf from "src/conf";
import { getRandomArbitrary, sleep } from "src/libs/shared";
import { OKXNetwork, WithdrawConfig } from "src/types/okx";

const OKX = new okx({
  apiKey: conf.okx.key,
  secret: conf.okx.secret,
  password: conf.okx.password,
  options: { defaultType: "spot" },
});

const subaccountETHBalance = async (subAcct: string) => {
  const {
    data: [data],
  } = await OKX.privateGetAssetSubaccountBalances({ subAcct, ccy: "ETH" });
  return {
    available: parseFloat(data.availBal),
    frozen: parseFloat(data.frozenBal),
  };
};

const getSubAccounts = () =>
  OKX.privateGetUsersSubaccountList().then(({ data }) => data.map((item: { subAcct: any }) => item.subAcct));

const moveETHfromSibAccountToMain = async (subAcct: string, amount: string) =>
  OKX.privatePostAssetTransfer({
    ccy: "ETH",
    amt: amount,
    from: 6, // Funding account
    to: 6, // Funding account
    type: 2, // sub-account to master account
    subAcct,
  });

export const consolidateETH = async () => {
  for (const subaccount of await getSubAccounts()) {
    const balance = await subaccountETHBalance(subaccount);
    if (balance.frozen === 0 && balance.available > 0) {
      await moveETHfromSibAccountToMain(subaccount, String(balance.available));
    }
  }
};

export const withdrawETH = async (config: WithdrawConfig, minDelay: number, maxDelay: number) => {
  const currencyNetworks = await OKX.fetchCurrencies();
  return await config.reduce(
    async (promise, item) => {
      const receipts = await promise;
      const pauseMs = getRandomArbitrary(minDelay, maxDelay);
      console.log("sleep for", pauseMs);
      await sleep(pauseMs);
      const ethNetworkConfig = (currencyNetworks.ETH.networks as any)[item.withdrawChain] as OKXNetwork;
      if (ethNetworkConfig.limits.withdraw.min > parseFloat(item.amount)) {
        throw new Error(`Amount to withdraw ${item.amount} is below ${ethNetworkConfig.limits.withdraw.min}`);
      }
      if (!ethNetworkConfig.withdraw) {
        throw new Error(`Withdraw ETH for network ${item.withdrawChain} is disabled`);
      }
      const withdrawalParams = {
        amt: parseFloat(item.amount),
        fee: ethNetworkConfig.fee,
        chain: ethNetworkConfig.info.chain,
      };
      const receipt = await OKX.withdraw("ETH", parseFloat(item.amount), item.address, undefined, withdrawalParams);
      console.log("withdraw with params", JSON.stringify(withdrawalParams));
      receipts.push(receipt);
      return receipts;
    },
    Promise.resolve([] as Transaction[]),
  );
};