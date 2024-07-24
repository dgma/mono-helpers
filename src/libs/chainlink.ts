import { PublicClient, Hex } from "viem";
import { CHAINLINK_CONTRACT_ABI } from "src/constants/chainlink";

export const getPrice = async (publicClient: PublicClient, address: Hex, targetDecimals: number) => {
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
    return price * 10n ** BigInt(targetDecimals - feedDecimals);
  }

  if (targetDecimals < feedDecimals) {
    return price / 10n ** BigInt(feedDecimals - targetDecimals);
  }

  return price;
};
