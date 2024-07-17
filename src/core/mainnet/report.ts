import { formatEther } from "viem";
import * as chains from "viem/chains";
import { getPublicClient } from "src/libs/clients";
import { getProfiles } from "src/libs/configs";
import { saveInFolder } from "src/libs/shared";

type EthBalancesReport = { [prop: string]: string };

export async function report(save: boolean) {
  const profiles = await getProfiles();
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
    saveInFolder("./reports/mainnet.report.json", JSON.stringify(data, null, 2));
  }
}
