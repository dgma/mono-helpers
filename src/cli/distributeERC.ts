import * as chains from "viem/chains";
import { distributeERC } from "src/core/distribution";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::distributeRC" });
  const conf = await getAppConf();
  const { chain, token } = conf.cli.distribute;
  await distributeERC(chains[chain], token);
  logger.info("finished", { label: "CLI::distributeRC" });
})();
