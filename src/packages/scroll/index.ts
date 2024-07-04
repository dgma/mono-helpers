import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { refreshProxy } from "src/libs/proxify";
import { Profile } from "src/types/profile";

const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;

const refreshAndCall = (index: string, addr: string) => async (report: any) => {
  const axiosInstance = await refreshProxy();
  const res = await axiosInstance.get(
    `https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/scroll/wallet-points?walletAddress=${addr}`,
  );

  report[index] = res.data;
  return report;
};

export async function report() {
  const finalReport = await Object.entries(profiles).reduce(
    (promise, [index, value]) => promise.then(refreshAndCall(index, value.wallets.evm.address!)),
    Promise.resolve({}),
  );
  console.log(finalReport);
}
