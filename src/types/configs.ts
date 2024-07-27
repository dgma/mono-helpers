import { Hex } from "viem";
import * as chains from "viem/chains";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";

export type Networks = "btc" | "evm" | "sol" | "tia" | "atom";

export type NetworkWallet = {
  readonly address?: string;
  readonly pkᵻ: string;
};

export type EVMWallet = { readonly address: Hex; readonly pkᵻ: Hex };

export type Wallet = {
  readonly [key in Networks]: NetworkWallet;
};

export type Profile = {
  [id: string]: {
    readonly wallets: Wallet;
    readonly mnemonicᵻ: string;
  };
};

export type ReportConf = {
  readonly scroll: { readonly save: boolean };
  readonly mainnet: { readonly params: string[]; readonly save: boolean };
};

export type AppConfig = {
  readonly proxy: {
    readonly userᵻ: string;
    readonly passᵻ: string;
    readonly hostᵻ: string;
    readonly portᵻ: string;
    readonly "reboot-linkᵻ": string;
  };
  readonly rpc: {
    readonly alchemy: {
      readonly keyᵻ: string;
    };
    readonly qnode: {
      readonly keyᵻ: string;
    };
  };
  readonly okx: {
    readonly keyᵻ: string;
    readonly secretᵻ: string;
    readonly passwordᵻ: string;
  };
  readonly randommer: {
    readonly keyᵻ: string;
  };
  readonly cli: {
    readonly cluster_id: string;
    readonly funding: {
      readonly chain: keyof typeof OKX_WITHDRAW_CHAINS;
      readonly filters: ("noFuel" | "onlyZero" | "lteBalance")[];
      readonly depositRange: [number, number];
      readonly lteBalance?: number;
      readonly maxFee: number;
    };
    readonly distribute: {
      readonly chain: keyof typeof chains;
      readonly token: Hex;
      readonly miller: Hex;
    };
    readonly fuel: {
      readonly minDeposit: number;
      readonly token: Hex;
    };
    readonly scroll: {
      readonly kelp: {
        readonly minDeposit: number;
      };
    };
    readonly report: ReportConf;
    readonly profiles: {
      readonly amount: number;
      readonly chains: Networks[];
    };
  };
};
