import { AxiosInstance } from "axios";
import { createWalletClient, http, publicActions, custom, createPublicClient } from "viem";
import * as chains from "viem/chains";
import conf from "src/conf";
import { Network as AlchemyNetwork } from "src/constants/alchemy";

type ChainIdToAlchemyNetworksMap = {
  [prop: number]: AlchemyNetwork;
};

const chainIdToAlchemyNetworksMap: ChainIdToAlchemyNetworksMap = {
  [chains.mainnet.id]: AlchemyNetwork.ETH_MAINNET,
};

const transport = (chain: chains.Chain, proxy?: AxiosInstance) => {
  if (!proxy) {
    return http();
  }

  return custom({
    async request(body: { method: string; params: any[] }) {
      const response = await proxy.post(
        `https://${chainIdToAlchemyNetworksMap[chain.id]}.g.alchemy.com/v2/${conf.rpc.alchemy.key}`,
        body,
      );
      return response.data.result;
    },
  });
};

export const getPublicClient = (chain: chains.Chain) =>
  createPublicClient({
    batch: {
      multicall: {
        wait: 16,
      },
    },
    cacheTime: 10_000,
    chain,
    transport: http(),
  });

export const getClient = (chain: chains.Chain, proxy?: AxiosInstance) =>
  createWalletClient({
    chain,
    transport: transport(chain, proxy),
  }).extend(publicActions);
