import { input, confirm } from "@inquirer/prompts";
import { generateWallet, supportedNetworks, Networks } from "src/packages/wallet";

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
  const amount = Number(await input({ message: "enter amount of wallets to generate" }));
  const defaultNetworks = await confirm({ message: "generate for all networks?", default: true });
  if (defaultNetworks) {
    return generateWallet(amount, supportedNetworks);
  }
  return generateWallet(amount, await getNetworks());
})();
