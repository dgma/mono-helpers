import readConf from "src/conf";
import { recoverProfiles } from "src/core/profiles";

(async function main() {
  console.log("recover script initiated");
  const conf = await readConf();
  await recoverProfiles(conf.cli.profiles.chains, conf.masterKey);
  console.log("recover script finished");
})();
