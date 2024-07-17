import { PublicClient, parseEther } from "viem";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { getPrice } from "src/libs/chainlink";

export const lteBalance = (minBalance: number) =>
  async function _lteBalance(client: PublicClient, address: `0x${string}`) {
    const balance = await client.getBalance({
      address,
    });
    const ethPrice = await getPrice(client, chainLinkAddresses.ETHUSD[chains.mainnet.id], 0);
    return ethPrice * balance <= parseEther(String(minBalance));
  };
