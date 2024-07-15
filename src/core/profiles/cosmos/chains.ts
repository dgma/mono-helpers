export type Chain = {
  bip44: {
    coinType: string;
  };
  addressPrefix: string;
};

export const chains = {
  cosmos: {
    bip44: {
      coinType: "118",
    },
    addressPrefix: "cosmos",
  },
  celestia: {
    bip44: {
      coinType: "118",
    },
    addressPrefix: "celestia",
  },
};
