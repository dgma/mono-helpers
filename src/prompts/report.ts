import { confirm, select } from "@inquirer/prompts";
import { report as fuelReport } from "src/packages/fuel";
import { report as l1EthBalance } from "src/packages/mainnet";
import { report as scrollReport } from "src/packages/scroll";

export const reportExecutors = {
  scrollReport,
  l1EthBalance,
  symbolic: () => {},
  fuel: fuelReport,
};

(async function main() {
  const reportType: keyof typeof reportExecutors = await select({
    message: "Select a report type",
    choices: [
      {
        name: "l1 balance",
        value: "l1EthBalance",
      },
      {
        name: "scroll",
        value: "scrollReport",
      },
      {
        name: "fuel",
        value: "fuel",
      },
      {
        name: "symbolic",
        value: "symbolic",
        disabled: true,
      },
    ],
  });
  const save = await confirm({ message: "save report into reports folder?", default: true });
  return reportExecutors[reportType](save);
})();
