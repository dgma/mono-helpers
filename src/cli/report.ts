import readConf from "src/conf";
import { report as fuelReport } from "src/core/fuel";
import { report as l1EthBalance } from "src/core/mainnet";
import { report as scrollReport } from "src/core/scroll";

const reportExecutors = {
  l1Balance: l1EthBalance,
  scroll: scrollReport,
  fuel: fuelReport,
};

(async function main() {
  console.log("report script initiated");
  const conf = await readConf();
  for (let reportType of conf.cli.report.type) {
    await reportExecutors[reportType](conf.cli.report.save);
  }
  console.log("report script finished");
})();
