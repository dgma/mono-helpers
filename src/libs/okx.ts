import { okx } from "ccxt";
import readConf from "src/conf";
import { OKXNetwork, WithdrawConfig } from "src/types/okx";

let OKX: okx;

const getOKX = async () => {
  if (!OKX) {
    const conf = await readConf();
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

export const withdrawETH = async (config: WithdrawConfig) => {
  const currencyNetworks = await (await getOKX()).fetchCurrencies();
  const ethNetworkConfig = (currencyNetworks.ETH.networks as any)[config.withdrawChain] as OKXNetwork;
  if (ethNetworkConfig.fee > parseFloat(config.maxFee)) {
    console.log(`Withdrawal fee is above allowed maximum ${config.maxFee}`);
    return;
  }
  if (ethNetworkConfig.limits.withdraw.min > parseFloat(config.amount)) {
    console.log(`Amount to withdraw ${config.amount} is below ${ethNetworkConfig.limits.withdraw.min}`);
    return;
  }
  if (!ethNetworkConfig.withdraw) {
    throw new Error(`Withdraw ETH for network ${config.withdrawChain} is disabled`);
  }
  const withdrawalParams = {
    amt: parseFloat(config.amount),
    fee: ethNetworkConfig.fee,
    chain: ethNetworkConfig.info.chain,
  };
  console.log("withdraw with params", JSON.stringify(withdrawalParams));
  return (await getOKX()).withdraw("ETH", parseFloat(config.amount), config.address, undefined, withdrawalParams);
};
