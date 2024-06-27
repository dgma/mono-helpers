import { input } from "@inquirer/prompts";
import { tx } from "src/packages/tx";

(async function main() {
  const network = await input({ message: "enter network" });
  console.log("ntw", network);
  return tx(network);
})();
