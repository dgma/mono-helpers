import { confirm, select } from "@inquirer/prompts";
import { reportExecutors } from "src/packages/reports";

(async function main() {
  const reportType: keyof typeof reportExecutors = await select({
    message: "Select a package manager",
    choices: [
      {
        name: "scroll",
        value: "scroll",
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
