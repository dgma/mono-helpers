import { recoverProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { getMasterKey } from "src/libs/shared";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::recover" });
  const conf = await getAppConf();
  const masterKey = await getMasterKey();
  await recoverProfiles(conf.cli.profiles.chains, masterKey);
  logger.info("finished", { label: "CLI::recover" });
})();
