import fs from "fs";
import * as bip39 from "bip39";
import { genBtc } from "./btc";
import { genTia, genAtom } from "./cosmos";
import { genEVM } from "./evm";
import { genSol } from "./sol";
import { getProfilesSafe, saveProfiles } from "src/libs/configs";
import { Networks, Profile, NetworkWallet } from "src/types/configs";

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

const generateAndSave = async (mnemonics: string[], networks: Networks[]) => {
  const profiles = await getProfilesSafe();
  const offsetIndex = profiles.length ? Number(Object.keys(profiles).sort((a, b) => Number(b) - Number(a))[0]) + 1 : 0;
  const data = mnemonics.reduce((acc, mnemonic, i) => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    acc[i + offsetIndex] = {
      mnemonicᵻ: mnemonic,
      wallets: genAll(seed, networks),
    };
    return acc;
  }, {} as Profile);
  saveProfiles({
    ...profiles,
    ...data,
  });
};

const genMnemonics = (amount: number) => Array.from({ length: amount }).map(() => bip39.generateMnemonic());

export const createProfiles = (amount: number, networks: Networks[]) => generateAndSave(genMnemonics(amount), networks);

export const recoverProfiles = (networks: Networks[]) =>
  generateAndSave(JSON.parse(fs.readFileSync(".mnemonics.json", "utf-8")) as string[], networks);
