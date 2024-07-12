import { okx } from "ccxt";
import { OKXNetwork, WithdrawConfig } from "./types";
import getEnv from "src/env";
import { getRandomArbitrary, sleep } from "src/libs/shared";

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
  config.reduce(
    async (promise, item) => {
      const txIDs = await promise;
      await sleep(getRandomArbitrary(minDelay, maxDelay));
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
        chainName: ethNetworkConfig.id,
        network: ethNetworkConfig.network,
      });
      txIDs.push(receipt.txid);
      return txIDs;
    },
    Promise.resolve([] as (string | undefined)[]),
  );
};

export type { SupportedChains, WithdrawChain } from "./types";
export { OKX_WITHDRAW_CHAINS } from "./constants";
