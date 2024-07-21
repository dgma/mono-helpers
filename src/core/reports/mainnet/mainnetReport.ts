import axiosRetry from "axios-retry";
import * as chains from "viem/chains";
import { getFuelReport } from "./fuel";
import { getProfiles } from "src/libs/configs";
import { getFormattedPortfolio } from "src/libs/portfolio";
import { refreshProxy } from "src/libs/proxify";
import { saveInFolder, getRandomArbitrary } from "src/libs/shared";
import { logger } from "src/logger";
import { JsonObj } from "src/types/common";

export async function mainnetReport({ save, params }: { save: boolean; params: string[] }) {
  const profiles = await getProfiles();
  const report: JsonObj = {};
  for (const [profileId, profile] of Object.entries(profiles)) {
    try {
      const address = profile.wallets.evm.address as `0x${string}`;
      const portfolio = await getFormattedPortfolio(address, chains.mainnet);
      const axiosInstance = await refreshProxy(getRandomArbitrary(10000, 20000));

      axiosRetry(axiosInstance, {
        retries: 3,
        retryDelay: (retryCount) => retryCount * 1000,
      });

      const reports = await Promise.all(
        params.map(async (reportName) => {
          switch (reportName) {
            case "fuel":
              return ["fuel", await getFuelReport(axiosInstance, address)] as [string, any];
            default:
              return [];
          }
        }),
      );

      report[profileId] = reports.reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {
          portfolio,
        } as JsonObj,
      );

      logger.info(`${profileId} ${JSON.stringify(report[profileId], null, 2)}`, {
        label: "mainnetReport",
      });
    } catch (error) {
      logger.error((error as { message: any })?.message, { label: "mainnetReport" });
      report[profileId] = {};
    }
  }

  if (save) {
    saveInFolder("./reports/mainnet.report.json", JSON.stringify(report, null, 2));
  }
}
