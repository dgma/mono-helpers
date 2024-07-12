import axiosRetry from "axios-retry";

import { getLpStats } from "./nuri";
import { accountPoints } from "./points";
import { refreshProxy } from "src/libs/proxify";
import { getProfiles, saveInFolder } from "src/libs/shared";

const refreshAndCall = (index: string, address: string) => async (report: any) => {
  try {
    const axiosInstance = await refreshProxy();

    axiosRetry(axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
    });

    const total_points = await accountPoints(axiosInstance, address);

    const NURI_LP_stats = await getLpStats(axiosInstance, address);

    report[index] = {
      total_points,
      NURI_LP_stats,
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
    saveInFolder("./reports/scroll.report.json", JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
