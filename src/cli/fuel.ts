import { initFuelDeposits } from "src/core/fuel";
import { getAppConf } from "src/libs/configs";

(async function main() {
  console.log("fuel script initiated");
  const conf = await getAppConf();
  await initFuelDeposits(conf.cli.fuel.minDeposit);
  console.log("fuel script finished");
})();
