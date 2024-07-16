import readConf from "src/conf";
import { initDeposits } from "src/core/fuel";

(async function main() {
  console.log("fuel script initiated");
  const conf = await readConf();
  await initDeposits(conf.masterKey, conf.cli.fuel.minDeposit);
  console.log("fuel script finished");
})();
