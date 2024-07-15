import conf from "src/conf";
import { report as fuelReport } from "src/packages/fuel";
import { report as l1EthBalance } from "src/packages/mainnet";
import { report as scrollReport } from "src/packages/scroll";

const reportExecutors = {
  l1Balance: l1EthBalance,
  scroll: scrollReport,
  fuel: fuelReport,
};

for (let reportType of conf.cli.report.type) {
  await reportExecutors[reportType](conf.cli.report.save);
}
