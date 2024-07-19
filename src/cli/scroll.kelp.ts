import { initKelpDeposits } from "src/core/scroll/kelp";
import { getAppConf } from "src/libs/configs";

(async function main() {
  console.log("scroll kelp script initiated");
  const conf = await getAppConf();
  await initKelpDeposits(conf.cli.scroll.kelp.minDeposit);
  console.log("scroll fuel script finished");
})();
