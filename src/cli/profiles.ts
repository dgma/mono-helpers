import { input, confirm, password } from "@inquirer/prompts";
import { validateMKey, validateProfileAmount } from "src/libs/validations";
import { createProfiles, supportedNetworks } from "src/packages/profiles";
import { Networks } from "src/types/profile";

const parseNetworks = (networks: string) => networks.split(",").filter((i) => i);

const getNetworks = async (message = "enter networks separated by comma, aka btc,eth"): Promise<Networks[]> => {
  const networks = await input({ message });
  const parsedNetworks = parseNetworks(networks);
  const notSupported = parsedNetworks.filter((ntw) => !(supportedNetworks as string[]).includes(ntw));
  if (notSupported.length) {
    return getNetworks(`${notSupported.join(",")} is not supported, reenter`);
  }
  return parsedNetworks as Networks[];
};

(async function main() {
  const amount = await input({ message: "enter amount of wallets to generate" }).then(validateProfileAmount);
  const masterKey = await password({ message: "enter encryption master key", mask: false }).then(validateMKey);
  const defaultNetworks = await confirm({ message: "generate for all networks?", default: true });
  const networks = defaultNetworks ? supportedNetworks : await getNetworks();
  return createProfiles(amount, networks, masterKey);
})();
