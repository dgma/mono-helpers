import axiosRetry from "axios-retry";
import { scroll } from "viem/chains";
import { isProfileMinted } from "./canvas";
import { getLpStats } from "./nuri";
import { accountPoints } from "./points";
import { getProfiles } from "src/libs/configs";
import { getFormattedPortfolio } from "src/libs/portfolio";
import { refreshProxy } from "src/libs/proxify";
import { saveInFolder, getRandomArbitrary } from "src/libs/shared";
import { logger } from "src/logger";

const refreshAndCall = (index: string, address: `0x${string}`) => async (report: any) => {
  try {
    const portfolio = await getFormattedPortfolio(address, scroll);
    const axiosInstance = await refreshProxy(getRandomArbitrary(10000, 20000));

    axiosRetry(axiosInstance, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000,
    });

    const total_points = await accountPoints(axiosInstance, address);

    const NURI_LP_stats = await getLpStats(axiosInstance, address);

    report[index] = {
      portfolio,
      total_points,
      NURI_LP_stats,
      isProfileMinted: await isProfileMinted(address),
    };
    logger.info(`${index} ${JSON.stringify(report[index], null, 2)}`, { label: "scrollReport" });
    return report;
  } catch (error) {
    logger.error((error as { message: any })?.message, { label: "scrollReport" });
    report[index] = {};
    return report;
  }
};

export async function scrollReport({ save }: { save: boolean }) {
  const profiles = await getProfiles();
  const data = await Object.entries(profiles).reduce(
    (promise, [index, value]) => promise.then(refreshAndCall(index, value.wallets.evm.address as `0x${string}`)),
    Promise.resolve({}),
  );
  if (save) {
    saveInFolder("./reports/scroll.report.json", JSON.stringify(data, null, 2));
  }
}
