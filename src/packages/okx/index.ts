import { okx } from "ccxt";
import getEnv from "src/env";

const OKX_NETWORKS = {
  ETH: "ETH",
  ARB: "ARBONE",
  OP: "OPTIMISM",
  ZKS: "zkSync Era",
  LINEA: "Linea",
  MATIC: "MATIC",
  BASE: "Base",
} as const;

const OKX = new okx({
  apiKey: getEnv("OKX_API_KEY"),
  secret: getEnv("OKX_SECRET_KEY"),
  password: getEnv("OKX_PASSWORD"),
  options: { defaultType: "spot" },
});

type WithdrawChain = (typeof OKX_NETWORKS)[keyof typeof OKX_NETWORKS];

type Network = {
  id: string;
  network: string;
  active: boolean;
  deposit: boolean;
  withdraw: boolean;
  fee: number;
  precision: number;
  limits: { withdraw: { min: number; max: number } };
  info: {
    canDep: boolean;
    canInternal: boolean;
    canWd: boolean;
    ccy: string;
    chain: string;
    depQuotaFixed: string;
    depQuoteDailyLayer2: string;
    logoLink: string;
    mainNet: boolean;
    maxFee: string;
    maxFeeForCtAddr: string;
    maxWd: string;
    minDep: string;
    minDepArrivalConfirm: string;
    minFee: string;
    minFeeForCtAddr: string;
    minWd: string;
    minWdUnlockConfirm: string;
    name: string;
    needTag: boolean;
    usedDepQuotaFixed: string;
    usedWdQuota: string;
    wdQuota: string;
    wdTickSz: string;
  };
};

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

export const withdrawETH = async (address: `0x${string}`, amount: string, withdrawChain: WithdrawChain) => {
  const currencyNetworks = await OKX.fetchCurrencies();
  const ethNetworkConfig = (currencyNetworks.ETH.networks as any)[withdrawChain] as Network;
  if (ethNetworkConfig.limits.withdraw.min > parseFloat(amount)) {
    throw new Error(`Amount to withdraw ${amount} is below ${ethNetworkConfig.limits.withdraw.min}`);
  }
  if (!ethNetworkConfig.withdraw) {
    throw new Error(`Withdraw ETH for network ${withdrawChain} is disabled`);
  }
  const receipt = await OKX.withdraw("ETH", parseFloat(amount), address, undefined, {
    amt: parseFloat(amount),
    fee: ethNetworkConfig.fee,
    chainName: ethNetworkConfig.id,
    network: ethNetworkConfig.network,
  });
  return receipt.txid;
};
