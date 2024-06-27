import { createWalletClient, http, publicActions } from "viem";
import { Chain } from "viem/chains";

const transport = http();

export const getClient = (chain: Chain) =>
  createWalletClient({
    chain,
    transport,
  }).extend(publicActions);
