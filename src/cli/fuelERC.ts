import { initERCFuelDeposits } from "src/core/fuel";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::fuelERC" });
  const conf = await getAppConf();
  await initERCFuelDeposits(conf.cli.fuel.token);
  logger.info("finished", { label: "CLI::fuelERC" });
})();
