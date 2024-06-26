import fs from "fs";
import * as bip39 from "bip39";
import { genBtc } from "./btc";
import { genTia, genAtom } from "./cosmos";
import { genEth } from "./eth";
import { genSol } from "./sol";

const amount = Number(process.env.AMOUNT) || 1;
const networks = process.env.NETWORKS;

const networksMap = {
  btc: genBtc,
  evm: genEth,
  sol: genSol,
  tia: genTia,
  atom: genAtom,
};

type Networks = keyof typeof networksMap;

const parsedNetworks = networks ? networks.split(",").filter((i) => i) : Object.keys(networksMap);

console.log("generate for", parsedNetworks);

interface NetworkWallet {
  address?: string;
  pkᵻ: string;
}
type Wallet = {
  [key in Networks]: NetworkWallet;
} & { mnemonicᵻ: string };

const generate = () =>
  Array.from({ length: amount }).reduce((acc: Wallet[]) => {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    acc.push({
      ...genAll(seed),
      mnemonicᵻ: mnemonic,
    });
    return acc;
  }, []);

const genAll = (seed: Buffer) =>
  (parsedNetworks as Networks[]).reduce(
    (acc, ntw) => {
      acc[ntw] = networksMap[ntw](seed);
      return acc;
    },
    {} as Record<Networks, NetworkWallet>,
  );

const extractPublicData = (wallet: Wallet) =>
  (parsedNetworks as Networks[]).reduce(
    (acc, ntw) => {
      acc[ntw] = wallet[ntw].address;
      return acc;
    },
    {} as Record<Networks, NetworkWallet["address"]>,
  );

export const generateWallet = () => {
  const data = generate();
  fs.writeFileSync(".wallets.json", JSON.stringify(data, null, 2));
  fs.writeFileSync(".wallets.pub.json", JSON.stringify(data.map(extractPublicData), null, 2));
};
