import { createWalletClient, http, publicActions, custom } from "viem";
import { Chain, mainnet } from "viem/chains";

const transport = (chain: Chain) => {
  if (chain.id === mainnet.id) {
    return http();
  }
  return custom({
    async request({ method, params }) {
      // const response = await customRpc.request(method, params);
      // return response;
      console.log(method, params);
    },
  });
};

export const getClient = (chain: Chain) =>
  createWalletClient({
    chain,
    transport: transport(chain),
  }).extend(publicActions);
