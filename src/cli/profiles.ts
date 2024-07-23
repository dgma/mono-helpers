import { createProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::profiles" });
  const conf = await getAppConf();
  await createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains);
  logger.info("finished", { label: "CLI::profiles" });
})();
