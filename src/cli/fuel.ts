import { initFuelDeposits } from "src/core/fuel";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::fuel" });
  const conf = await getAppConf();
  await initFuelDeposits(conf.cli.fuel.minDeposit);
  logger.info("finished", { label: "CLI::encrypt" });
})();
