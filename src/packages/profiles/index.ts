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

const genAll = (seed: Buffer, networks: Networks[]) =>
  networks.reduce(
    (acc, ntw) => {
      acc[ntw] = networksMap[ntw](seed);
      return acc;
    },
    {} as Record<Networks, NetworkWallet>,
  );

const generateAndSave = (mnemonics: string[], networks: Networks[]) => {
  const addProfiles = fs.existsSync(".profiles.json");
  const profiles = addProfiles ? (JSON.parse(fs.readFileSync(".profiles.json", "utf-8")) as Profile) : {};
  const offsetIndex = addProfiles ? Number(Object.keys(profiles).sort((a, b) => Number(b) - Number(a))[0]) + 1 : 0;
  const data = mnemonics.reduce((acc: Profile, mnemonic, i) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    acc[i + offsetIndex] = {
      mnemonicᵻ: mnemonic,
      wallets: genAll(seed, networks),
    };
    return acc;
  }, {});
  fs.writeFileSync(
    ".profiles.json",
    JSON.stringify(
      {
        ...profiles,
        ...data,
      },
      null,
      2,
    ),
  );
};

export const createProfiles = (amount: number, networks: Networks[]) => {
  generateAndSave(
    Array.from({ length: amount }).map(() => bip39.generateMnemonic()),
    networks,
  );
};

export const recoverProfiles = (networks: Networks[]) => {
  generateAndSave(JSON.parse(fs.readFileSync(".mnemonics.json", "utf-8")) as string[], networks);
};