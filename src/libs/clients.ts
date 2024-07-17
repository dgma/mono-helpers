import { AxiosInstance } from "axios";
import { createWalletClient, http, publicActions, custom, createPublicClient, PublicClient, WalletClient } from "viem";
import * as chains from "viem/chains";
import { Network as AlchemyNetwork } from "src/constants/alchemy";
import { getAppConf } from "src/libs/configs";

type ChainIdToAlchemyNetworksMap = {
  [prop: number]: AlchemyNetwork;
};

const chainIdToAlchemyNetworksMap: ChainIdToAlchemyNetworksMap = {
  [chains.mainnet.id]: AlchemyNetwork.ETH_MAINNET,
};

async function transport(chain: chains.Chain, proxy?: AxiosInstance) {
  if (!proxy) {
    return http();
  }

  const conf = await getAppConf();

  return custom({
    async request(body: { method: string; params: any[] }) {
      const response = await proxy.post(
        `https://${chainIdToAlchemyNetworksMap[chain.id]}.g.alchemy.com/v2/${conf.rpc.alchemy.keyᵻ}`,
        body,
      );
      return response.data.result;
    },
  });
}

let publicClient: PublicClient;

const initiatePublicClient = (chain: chains.Chain) =>
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

export const getPublicClient = (chain: chains.Chain) => {
  if (!publicClient || publicClient.chain !== chain) {
    publicClient = initiatePublicClient(chain);
  }
  return publicClient;
};

type CustomClient = PublicClient & WalletClient & { proxy?: AxiosInstance };

let customClient: CustomClient;

const initiateWalletClient = async (chain: chains.Chain, proxy?: AxiosInstance) => {
  const client: CustomClient = createWalletClient({
    chain,
    transport: await transport(chain, proxy),
  }).extend(publicActions);
  client.proxy = proxy;
  return client;
};

export const getClient = async (chain: chains.Chain, proxy?: AxiosInstance) => {
  if (!customClient || customClient.chain !== chain || customClient.proxy !== proxy) {
    customClient = await initiateWalletClient(chain, proxy);
  }
  return customClient;
};
