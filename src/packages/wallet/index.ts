import fs from "fs";
import * as bip39 from "bip39";
import { genBtc } from "./btc";
import { genTia, genAtom } from "./cosmos";
import { genEth } from "./eth";
import { genSol } from "./sol";

const networksMap = {
  btc: genBtc,
  evm: genEth,
  sol: genSol,
  tia: genTia,
  atom: genAtom,
};

export type Networks = keyof typeof networksMap;

export const supportedNetworks = Object.keys(networksMap) as Networks[];

interface NetworkWallet {
  address?: string;
  pkᵻ: string;
}
type Wallet = {
  [key in Networks]: NetworkWallet;
} & { mnemonicᵻ: string };

const generate = (amount: number, networks: Networks[]) =>
  Array.from({ length: amount }).reduce((acc: Wallet[]) => {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    acc.push({
      ...genAll(seed, networks),
      mnemonicᵻ: mnemonic,
    });
    return acc;
  }, []);

const genAll = (seed: Buffer, networks: Networks[]) =>
  networks.reduce(
    (acc, ntw) => {
      acc[ntw] = networksMap[ntw](seed);
      return acc;
    },
    {} as Record<Networks, NetworkWallet>,
  );

const extractPublicData = (networks: Networks[]) => (wallet: Wallet) =>
  networks.reduce(
    (acc, ntw) => {
      acc[ntw] = wallet[ntw].address;
      return acc;
    },
    {} as Record<Networks, NetworkWallet["address"]>,
  );

export const generateWallet = (amount: number, networks: Networks[]) => {
  const data = generate(amount, networks);
  fs.writeFileSync(".wallets.json", JSON.stringify(data, null, 2));
  fs.writeFileSync(".wallets.pub.json", JSON.stringify(data.map(extractPublicData(networks)), null, 2));
};
