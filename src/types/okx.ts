import { Hex } from "viem";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";

export type SupportedChains = keyof typeof OKX_WITHDRAW_CHAINS;

export type WithdrawChain = (typeof OKX_WITHDRAW_CHAINS)[SupportedChains];

export type OKXNetwork = {
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

export type WithdrawConfig = {
  address: Hex;
  amount: string;
  chain: string;
  fee: string;
};
