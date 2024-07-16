import readConf from "src/conf";
import { createProfiles } from "src/core/profiles";

(async function main() {
  console.log("profiles script initiated");
  const conf = await readConf();
  await createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains, conf.masterKey);
  console.log("profiles script finished");
})();
