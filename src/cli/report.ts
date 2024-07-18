import { mainnetReport } from "src/core/reports/mainnet";
import { scrollReport } from "src/core/reports/scroll";
import { getAppConf } from "src/libs/configs";
import { Entries } from "src/types/common";
import { ReportConf } from "src/types/configs";

(async function main() {
  console.log("report script initiated");
  const conf = await getAppConf();
  for (let [reportType, reportConf] of Object.entries(conf.cli.report) as Entries<typeof conf.cli.report>) {
    switch (reportType) {
      case "scroll":
        await scrollReport(reportConf as ReportConf["scroll"]);
        break;
      case "mainnet":
        await mainnetReport(reportConf as ReportConf["mainnet"]);
        break;
      default:
        break;
    }
  }
  console.log("report script finished");
})();
