import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { formatEther } from "viem";
import * as chains from "viem/chains";
import { getPublicClient } from "src/libs/clients";
import { Profile } from "src/types/profile";

type EthBalancesReport = { [prop: string]: string };

export async function report(save: boolean) {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;
  const publicClient = getPublicClient(chains.mainnet);
  const requests = Object.entries(profiles).map(async ([key, value]) => [
    key,
    formatEther(
      await publicClient.getBalance({
        address: value.wallets.evm.address as `0x${string}`,
      }),
    ),
  ]);

  const data = (await Promise.all(requests)).reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as EthBalancesReport);

  console.log(JSON.stringify(data, null, 2));
  if (save) {
    if (!existsSync("reports")) {
      mkdirSync("reports");
    }
    writeFileSync("./reports/mainnet.report.json", JSON.stringify(data, null, 2));
  }
}
