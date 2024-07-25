import * as chains from "viem/chains";
import { mill } from "src/core/distribution";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::millERC" });
  const conf = await getAppConf();
  const { chain, token, miller } = conf.cli.distribute;
  await mill(chains[chain], token, miller);
  logger.info("finished", { label: "CLI::millERC" });
})();
