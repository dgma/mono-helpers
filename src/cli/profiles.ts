import { createProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { getMasterKey } from "src/libs/shared";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::profiles" });
  const conf = await getAppConf();
  const masterKey = await getMasterKey();
  await createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains, masterKey);
  logger.info("finished", { label: "CLI::profiles" });
})();
