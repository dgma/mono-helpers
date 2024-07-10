import { password } from "@inquirer/prompts";
import { validateMKey } from "src/libs/validations";
import { deposit } from "src/packages/fuel";

(async function main() {
  const masterKey = await password({ message: "enter encryption master key", mask: false }).then(validateMKey);
  return deposit(masterKey);
})();
