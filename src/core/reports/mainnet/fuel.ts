import type { AxiosInstance } from "axios";
import { zeroAddress, Hex, formatUnits } from "viem";
import * as chains from "viem/chains";
import { TOKENS, ERC_20_BASE_ABI } from "src/constants/erc20";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { getPublicClient } from "src/libs/clients";

const getMultiCallResult = <T>({ result }: { result?: T }) => result;

export async function accountPoints(axiosInstance: AxiosInstance, address: Hex) {
  const scrollPoints = await axiosInstance.get<{
    total_points: number;
    user_rank: number;
    user_address: Hex;
  }>(`https://app.fuel.network/earn-points/api/points/${address}`);

  return scrollPoints.data?.total_points;
}

export const getFuelReport = async (axiosInstance: AxiosInstance, address: Hex) => {
  try {
    const client = await getPublicClient(chains.mainnet);
    const total_points = await accountPoints(axiosInstance, address);

    const tokenSymbols = (
      await client.multicall({
        contracts: TOKENS[chains.mainnet.id].map((address) => ({
          abi: ERC_20_BASE_ABI,
          functionName: "symbol" as const,
          address,
        })),
      })
    )
      .map(getMultiCallResult)
      .concat(["ETH"]);

    const tokenDecimals = (
      await client.multicall({
        contracts: TOKENS[chains.mainnet.id].map((address) => ({
          abi: ERC_20_BASE_ABI,
          functionName: "decimals" as const,
          address,
        })),
      })
    )
      .map(getMultiCallResult)
      .concat([18]);

    const fuelContract = {
      address: FUEL_POINTS_CONTRACT,
      abi: FUEL_POINTS_CONTRACT_ABI,
      functionName: "getBalance" as const,
    };

    const balances = (
      await client.multicall({
        contracts: TOKENS[chains.mainnet.id]
          .map((tokenAddress) => ({
            ...fuelContract,
            args: [address, tokenAddress],
          }))
          .concat({
            ...fuelContract,
            args: [address, zeroAddress],
          }),
      })
    ).map(getMultiCallResult);

    const deposits = tokenSymbols.reduce(
      (acc, symbol, index) => {
        acc[symbol!] = formatUnits(balances[index]!, tokenDecimals[index]!);
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      total_points,
      deposits,
    };
  } catch (error) {
    console.log((error as { message: any })?.message);
    return {};
  }
};
