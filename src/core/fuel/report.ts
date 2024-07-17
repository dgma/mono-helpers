import type { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { zeroAddress, PublicClient, formatEther } from "viem";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { getPublicClient } from "src/libs/clients";
import { getProfiles } from "src/libs/configs";
import { refreshProxy } from "src/libs/proxify";
import { saveInFolder } from "src/libs/shared";

export async function accountPoints(axiosInstance: AxiosInstance, address: string) {
  const scrollPoints = await axiosInstance.get<{
    total_points: number;
    user_rank: number;
    user_address: `0x${string}`;
  }>(`https://app.fuel.network/earn-points/api/points/${address}`);

  return scrollPoints.data?.total_points;
}

const refreshAndCall = (index: string, address: string, client: PublicClient) => async (report: any) => {
  try {
    const axiosInstance = await refreshProxy();

    axiosRetry(axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
    });

    const total_points = await accountPoints(axiosInstance, address);

    const userBalanceInFuel = await client.readContract({
      address: FUEL_POINTS_CONTRACT,
      abi: FUEL_POINTS_CONTRACT_ABI,
      functionName: "getBalance",
      args: [address as `0x${string}`, zeroAddress],
    });

    report[index] = {
      total_points,
      deposit: formatEther(userBalanceInFuel),
    };
    return report;
  } catch (error) {
    console.log((error as { message: any })?.message);
    report[index] = {};
    return report;
  }
};

export async function report(save: boolean) {
  const profiles = await getProfiles();
  const client = getPublicClient(chains.mainnet);

  const data = await Object.entries(profiles).reduce(
    (promise, [index, value]) => promise.then(refreshAndCall(index, value.wallets.evm.address!, client)),
    Promise.resolve({}),
  );
  if (save) {
    saveInFolder("./reports/fuel.report.json", JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
