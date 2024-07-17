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
    report: {
      type: ("l1Balance" | "scroll" | "fuel")[];
      save?: boolean;
    };
    profiles: {
      amount: number;
      chains: Networks[];
    };
  };
};