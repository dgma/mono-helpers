import * as chains from "viem/chains";
import { getProfiles } from "src/libs/configs";
import { getFormattedPortfolio } from "src/libs/portfolio";
import { saveInFolder } from "src/libs/shared";

type EthBalancesReport = Record<string, Record<string, string>>;

export async function report(save: boolean) {
  const profiles = await getProfiles();
  const requests = Object.entries(profiles).map(
    async ([key, value]) =>
      [key, await getFormattedPortfolio(value.wallets.evm.address as `0x${string}`, chains.mainnet)] as const,
  );

  const data = (await Promise.all(requests)).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as EthBalancesReport);

  if (save) {
    saveInFolder("./reports/mainnet.report.json", JSON.stringify(data, null, 2));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
