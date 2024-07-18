import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";

export type Networks = "btc" | "evm" | "sol" | "tia" | "atom";

export type NetworkWallet = {
  address?: string;
  pkᵻ: string;
};

export type Wallet = {
  [key in Networks]: NetworkWallet;
};

export type Profile = {
  [id: string]: {
    wallets: Wallet;
    mnemonicᵻ: string;
  };
};

export type ReportConf = {
  readonly scroll: { readonly save: boolean };
  readonly mainnet: { readonly params: string[]; readonly save: boolean };
};

export type AppConfig = {
  proxy: {
    userᵻ: string;
    passᵻ: string;
    hostᵻ: string;
    portᵻ: string;
    "reboot-linkᵻ": string;
  };
  rpc: {
    alchemy: {
      keyᵻ: string;
    };
  };
  okx: {
    keyᵻ: string;
    secretᵻ: string;
    passwordᵻ: string;
  };
  cli: {
    funding: {
      chain: keyof typeof OKX_WITHDRAW_CHAINS;
      filters: ("noFuel" | "onlyZero" | "lteBalance")[];
      depositRange: [number, number];
      lteBalance?: number;
      maxFee: number;
    };
    fuel: {
      minDeposit: number;
    };
    scroll: {
      kelp: {
        minDeposit: number;
      };
    };
    report: ReportConf;
    profiles: {
      amount: number;
      chains: Networks[];
    };
  };
};
