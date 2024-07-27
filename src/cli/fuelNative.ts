import { initNativeFuelDeposits } from "src/core/fuel";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::fuelNative" });
  const conf = await getAppConf();
  await initNativeFuelDeposits(conf.cli.fuel.minDeposit);
  logger.info("finished", { label: "CLI::fuelNative" });
})();
