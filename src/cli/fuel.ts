import readConf from "src/conf";
import { initDeposits } from "src/core/fuel";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  const key = await getMasterKey();
  console.log("initiated");
  const conf = await readConf();
  await initDeposits(key, conf.cli.fuel.minDeposit);
  console.log("finished");
})();
