import fs from "fs";
import * as bip39 from "bip39";
import { genBtc } from "./btc";
import { genTia, genAtom } from "./cosmos";
import { genEVM } from "./evm";
import { genSol } from "./sol";
import { Networks, Profile, NetworkWallet } from "src/types/profile";

const networksMap = {
  btc: genBtc,
  evm: genEVM,
  sol: genSol,
  tia: genTia,
  atom: genAtom,
};

export const supportedNetworks = Object.keys(networksMap) as Networks[];

const generate = (amount: number, networks: Networks[]) =>
  Array.from({ length: amount }).reduce((acc: Profile, _, i) => {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    acc[i] = {
      mnemonicᵻ: mnemonic,
      wallets: genAll(seed, networks),
    };
    return acc;
  }, {});

const genAll = (seed: Buffer, networks: Networks[]) =>
  networks.reduce(
    (acc, ntw) => {
      acc[ntw] = networksMap[ntw](seed);
      return acc;
    },
    {} as Record<Networks, NetworkWallet>,
  );

export const generateWallet = (amount: number, networks: Networks[]) => {
  const data = generate(amount, networks);
  fs.writeFileSync(".profiles.json", JSON.stringify(data, null, 2));
};
