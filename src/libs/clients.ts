import { AxiosInstance } from "axios";
import { createWalletClient, http, publicActions, custom, createPublicClient, PublicClient, WalletClient } from "viem";
import * as chains from "viem/chains";
import { Network as AlchemyNetwork } from "src/constants/alchemy";
import { getAppConf } from "src/libs/configs";
import { sleep } from "src/libs/shared";
import { logger } from "src/logger";

type ChainIdToAlchemyNetworksMap = {
  [prop: number]: AlchemyNetwork;
};

const chainIdToAlchemyNetworksMap: ChainIdToAlchemyNetworksMap = {
  [chains.mainnet.id]: AlchemyNetwork.ETH_MAINNET,
};

const getRpcUrl = async (chain: chains.Chain) => {
  const conf = await getAppConf();
  switch (chain.id) {
    case chains.scroll.id:
      // return chains.scroll.rpcUrls.default.http[0];
      // return "https://scroll.drpc.org";
      return `https://blue-greatest-knowledge.scroll-mainnet.quiknode.pro/${conf.rpc.qnode.keyᵻ}`;
    default:
      return `https://${chainIdToAlchemyNetworksMap[chain.id]}.g.alchemy.com/v2/${conf.rpc.alchemy.keyᵻ}`;
  }
};

async function transport(chain: chains.Chain, proxy?: AxiosInstance) {
  const rpcUrl = await getRpcUrl(chain);
  if (!proxy) {
    return http(rpcUrl);
  }

  return custom({
    async request(body: { method: string; params: any[] }) {
      if (chain.id === chains.scroll.id) {
        await sleep(1500);
      }

      logger.debug(`request ${JSON.stringify(body)}`, { label: "Custom_RPC_req" });
      const response = await proxy.post(rpcUrl, body);
      logger.debug(`response status ${response.status}, data ${JSON.stringify(response.data)}`, {
        label: "Custom_RPC_req",
      });
      return response.data.result;
    },
  });
}

let publicClient: PublicClient;

const initiatePublicClient = async (chain: chains.Chain) =>
  createPublicClient({
    batch: {
      multicall: {
        wait: 100,
      },
    },
    cacheTime: 60_000,
    chain,
    transport: http(await getRpcUrl(chain)),
  });

export const getPublicClient = async (chain: chains.Chain) => {
  if (!publicClient || publicClient.chain?.id !== chain.id) {
    publicClient = await initiatePublicClient(chain);
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
