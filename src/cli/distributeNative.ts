import * as chains from "viem/chains";
import { distributeNative } from "src/core/distribution";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::distributeNative" });
  const conf = await getAppConf();
  const { chain } = conf.cli.distribute;
  await distributeNative(chains[chain]);
  logger.info("finished", { label: "CLI::distributeNative" });
})();
