import conf from "src/conf";
import { initDeposits } from "src/core/fuel";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  const key = await getMasterKey();
  console.log("initiated");
  await initDeposits(key, conf.cli.fuel.minDeposit);
  console.log("finished");
})();
