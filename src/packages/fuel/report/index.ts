import type { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { refreshProxy } from "src/libs/proxify";
import { getProfiles, saveInFolder } from "src/libs/shared";

export async function accountPoints(axiosInstance: AxiosInstance, address: string) {
  const scrollPoints = await axiosInstance.get<
    { total_points: number; user_rank: number; user_address: `0x${string}` }[]
  >(`https://app.fuel.network/earn-points/api/points/${address}`);

  return scrollPoints.data[0]?.total_points;
}

const refreshAndCall = (index: string, address: string) => async (report: any) => {
  try {
    const axiosInstance = await refreshProxy();

    axiosRetry(axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
    });

    const total_points = await accountPoints(axiosInstance, address);

    report[index] = {
      total_points,
    };
    return report;
  } catch (error) {
    console.log((error as { message: any })?.message);
    report[index] = {};
    return report;
  }
};

export async function report(save: boolean) {
  const profiles = getProfiles();

  const data = await Object.entries(profiles).reduce(
    (promise, [index, value]) => promise.then(refreshAndCall(index, value.wallets.evm.address!)),
    Promise.resolve({}),
  );
  if (save) {
    saveInFolder("./reports/fuel.report.json", JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
