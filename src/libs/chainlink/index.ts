import { PublicClient } from "viem";
import { CHAINLINK_CONTRACT_ABI } from "./constants";

export { chainLinkAddresses } from "./constants";

export const getPrice = async (publicClient: PublicClient, address: `0x${string}`, targetDecimals: number) => {
  const [, price, , ,] = await publicClient.readContract({
    address,
    abi: CHAINLINK_CONTRACT_ABI,
    functionName: "latestRoundData",
  });

  const feedDecimals = await publicClient.readContract({
    address,
    abi: CHAINLINK_CONTRACT_ABI,
    functionName: "decimals",
  });

  if (targetDecimals > feedDecimals) {
    return price * BigInt(targetDecimals - feedDecimals);
  }

  if (targetDecimals < feedDecimals) {
    const div = BigInt(feedDecimals - targetDecimals);
    const drop = price % BigInt(feedDecimals - targetDecimals);
    return (price - drop) / div;
  }

  return price;
};
