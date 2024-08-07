import { okx } from "ccxt";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";
import { OKXNetwork, WithdrawConfig, WithdrawChain } from "src/types/okx";

let OKX: okx;

const getOKX = async () => {
  if (!OKX) {
    const conf = await getAppConf();
    OKX = new okx({
      apiKey: conf.okx.keyᵻ,
      secret: conf.okx.secretᵻ,
      password: conf.okx.passwordᵻ,
      options: { defaultType: "spot" },
    });
  }
  return OKX;
};

const subaccountETHBalance = async (subAcct: string) => {
  const {
    data: [data],
  } = await (await getOKX()).privateGetAssetSubaccountBalances({ subAcct, ccy: "ETH" });
  return {
    available: parseFloat(data.availBal),
    frozen: parseFloat(data.frozenBal),
  };
};

const getSubAccounts = async () =>
  (await getOKX())
    .privateGetUsersSubaccountList()
    .then(({ data }) => data.map((item: { subAcct: any }) => item.subAcct));

const moveETHfromSibAccountToMain = async (subAcct: string, amount: string) =>
  (await getOKX()).privatePostAssetTransfer({
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

export const EVMNetworksConfig = async (chain: WithdrawChain): Promise<OKXNetwork> => {
  const currencyNetworks = await (await getOKX()).fetchCurrencies();
  const ethNetworkConfig = (currencyNetworks.ETH.networks as any)[chain] as OKXNetwork;
  return ethNetworkConfig;
};

export const withdrawETH = async (config: WithdrawConfig) => {
  const withdrawalParams = {
    amt: config.amount,
    chain: config.chain,
    fee: config.fee,
  };
  logger.info(`withdraw with params ${JSON.stringify(withdrawalParams)}`, { label: "okx" });
  return (await getOKX()).withdraw("ETH", parseFloat(config.amount), config.address, undefined, withdrawalParams);
};
