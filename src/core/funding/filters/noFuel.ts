import { zeroAddress, PublicClient, Hex } from "viem";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";

export const noFuel = async (client: PublicClient, address: Hex) => {
  const userBalanceInFuel = await client.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [address, zeroAddress],
  });
  return userBalanceInFuel === 0n;
};
