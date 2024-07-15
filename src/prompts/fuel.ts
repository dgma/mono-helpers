import { password, input } from "@inquirer/prompts";
import { validateMKey, validatePositiveNumber } from "src/libs/validations";
import { initDeposits } from "src/packages/fuel";

(async function main() {
  const masterKey = await password({ message: "enter encryption master key", mask: false }).then(validateMKey);
  const minDeposit = await input({ message: "enter minimal usd deposit" }).then(validatePositiveNumber);
  return initDeposits(masterKey, minDeposit);
})();
