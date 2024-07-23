import { recoverProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::recover" });
  const conf = await getAppConf();
  await recoverProfiles(conf.cli.profiles.chains);
  logger.info("finished", { label: "CLI::recover" });
})();
