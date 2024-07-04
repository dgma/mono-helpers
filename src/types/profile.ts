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
