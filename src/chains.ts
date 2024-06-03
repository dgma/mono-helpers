import * as viemChains from "viem/chains";

const chains = {
  arbitrumSepolia: viemChains.arbitrumSepolia,
  localhost: viemChains.localhost,
  mainnet: viemChains.mainnet,
  sepolia: viemChains.sepolia,
} as const;

export type SupportedChains = keyof typeof chains;

export default chains;
