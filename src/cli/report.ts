import { report as fuelReport } from "src/core/fuel";
import { report as l1EthBalance } from "src/core/mainnet";
import { report as scrollReport } from "src/core/scroll";
import { getAppConf } from "src/libs/configs";

const reportExecutors = {
  l1Balance: l1EthBalance,
  scroll: scrollReport,
  fuel: fuelReport,
};

(async function main() {
  console.log("report script initiated");
  const conf = await getAppConf();
  for (let reportType of conf.cli.report.type) {
    await reportExecutors[reportType](conf.cli.report.save ?? false);
  }
  console.log("report script finished");
})();
