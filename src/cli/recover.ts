import { recoverProfiles } from "src/core/profiles";
import { getAppConf } from "src/libs/configs";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("recover script initiated");
  const conf = await getAppConf();
  const masterKey = await getMasterKey();
  await recoverProfiles(conf.cli.profiles.chains, masterKey);
  console.log("recover script finished");
})();
