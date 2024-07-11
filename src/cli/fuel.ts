import { password } from "@inquirer/prompts";
import { validateMKey, validatePositiveNumber } from "src/libs/validations";
import { deposit } from "src/packages/fuel";

(async function main() {
  const masterKey = await password({ message: "enter encryption master key", mask: false }).then(validateMKey);
  const medianDeposit = await password({ message: "enter deposit median deposit in usd", mask: false }).then(
    validatePositiveNumber,
  );
  return deposit(masterKey, medianDeposit);
})();
