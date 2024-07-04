import { confirm } from "@inquirer/prompts";
import { report } from "src/packages/scroll";

(async function main() {
  const save = await confirm({ message: "save report into reports folder?", default: true });
  return report(save);
})();
