import type { AxiosInstance } from "axios";
import { zeroAddress, formatEther } from "viem";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { getPublicClient } from "src/libs/clients";

export async function accountPoints(axiosInstance: AxiosInstance, address: `0x${string}`) {
  const scrollPoints = await axiosInstance.get<{
    total_points: number;
    user_rank: number;
    user_address: `0x${string}`;
  }>(`https://app.fuel.network/earn-points/api/points/${address}`);

  return scrollPoints.data?.total_points;
}

export const getFuelReport = async (axiosInstance: AxiosInstance, address: `0x${string}`) => {
  try {
    const client = await getPublicClient(chains.mainnet);

    const total_points = await accountPoints(axiosInstance, address);

    const userBalanceInFuel = await client.readContract({
      address: FUEL_POINTS_CONTRACT,
      abi: FUEL_POINTS_CONTRACT_ABI,
      functionName: "getBalance",
      args: [address as `0x${string}`, zeroAddress],
    });

    return {
      total_points,
      deposit: formatEther(userBalanceInFuel),
    };
  } catch (error) {
    console.log((error as { message: any })?.message);
    return {};
  }
};