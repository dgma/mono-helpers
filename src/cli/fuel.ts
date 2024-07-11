import { password, input } from "@inquirer/prompts";
import { validateMKey, validatePositiveNumber } from "src/libs/validations";
import { initDeposits } from "src/packages/fuel";

(async function main() {
  const masterKey = await password({ message: "enter encryption master key", mask: false }).then(validateMKey);
  const medianDeposit = await input({ message: "enter deposit median deposit in usd" }).then(validatePositiveNumber);
  return initDeposits(masterKey, medianDeposit);
})();
