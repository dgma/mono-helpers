import { zeroAddress, PublicClient } from "viem";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/packages/fuel/constants";

export const noFuel = async (client: PublicClient, address: `0x${string}`) => {
  const userBalanceInFuel = await client.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [address, zeroAddress],
  });
  return userBalanceInFuel === 0n;
};
