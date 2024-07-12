import { okx, Transaction } from "ccxt";
import { OKXNetwork, WithdrawConfig } from "./types";
import getEnv from "src/env";
import { getRandomArbitrary, sleep, saveInFolder } from "src/libs/shared";

const OKX = new okx({
  apiKey: getEnv("OKX_API_KEY"),
  secret: getEnv("OKX_SECRET_KEY"),
  password: getEnv("OKX_PASSWORD"),
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
  const data = await config.reduce(
    async (promise, item, index) => {
      const txIDs = await promise;
      if (index) {
        await sleep(getRandomArbitrary(minDelay, maxDelay));
      }
      const ethNetworkConfig = (currencyNetworks.ETH.networks as any)[item.withdrawChain] as OKXNetwork;
      if (ethNetworkConfig.limits.withdraw.min > parseFloat(item.amount)) {
        throw new Error(`Amount to withdraw ${item.amount} is below ${ethNetworkConfig.limits.withdraw.min}`);
      }
      if (!ethNetworkConfig.withdraw) {
        throw new Error(`Withdraw ETH for network ${item.withdrawChain} is disabled`);
      }
      const receipt = await OKX.withdraw("ETH", parseFloat(item.amount), item.address, undefined, {
        amt: parseFloat(item.amount),
        fee: ethNetworkConfig.fee,
        chain: ethNetworkConfig.info.chain,
      });
      txIDs.push(receipt);
      return txIDs;
    },
    Promise.resolve([] as Transaction[]),
  );
  saveInFolder(
    "./reports/withdrawals.report.json",
    JSON.stringify(
      {
        [new Date().toISOString()]: data,
      },
      null,
      2,
    ),
  );
};

export type { SupportedChains, WithdrawChain } from "./types";
export { OKX_WITHDRAW_CHAINS } from "./constants";
