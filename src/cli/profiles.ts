import { createProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("profiles script initiated");
  const conf = await getAppConf();
  const masterKey = await getMasterKey();
  await createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains, masterKey);
  console.log("profiles script finished");
})();
