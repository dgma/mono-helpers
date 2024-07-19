import { initKelpDeposits } from "src/core/scroll/kelp";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::scroll.kelp" });
  const conf = await getAppConf();
  await initKelpDeposits(conf.cli.scroll.kelp.minDeposit);
  logger.info("finished", { label: "CLI::scroll.kelp" });
})();
