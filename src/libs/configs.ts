import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { decryptJson, encrypt } from "./crypt";
import { getMasterKey, saveInFolder } from "./shared";
import { logger } from "src/logger";
import { JsonObj } from "src/types/common";
import { AppConfig, Profile, EVMWallet } from "src/types/configs";

let config: AppConfig;

export const getAppConf = async () => {
  if (!config) {
    const masterKey = await getMasterKey();
    config = {
      ...(decryptJson(readFileSync(resolve(".", ".secrets"), "utf-8").trimEnd(), masterKey) as JsonObj),
      ...(JSON.parse(readFileSync(resolve(".", ".apprc"), "utf-8").trimEnd()) as JsonObj),
    } as AppConfig;
  }
  return config;
};

let profiles: Profile;

export const getProfiles = async () => {
  if (!profiles) {
    const folder = await operationFolder();
    const masterKey = await getMasterKey();
    profiles = decryptJson(readFileSync(`${folder}/.profiles`, "utf-8").trimEnd(), masterKey) as Profile;
  }
  return profiles;
};

export const getProfilesSafe = async () => {
  const folder = await operationFolder();
  const profilesExist = existsSync(`${folder}/.profiles`);
  if (profilesExist) {
    return getProfiles();
  }
  logger.warn(`.profiles file is not exist for path ${folder}/.profiles, return empty`, {
    label: "utils/getProfilesSafe",
  });
  return {};
};

export const saveProfiles = async (profiles: Profile) => {
  const masterKey = await getMasterKey();
  const folder = await operationFolder();
  return saveInFolder(`${folder}/.profiles`, encrypt(JSON.stringify(profiles), masterKey));
};

let wallets: EVMWallet[];

export const getEVMWallets = async () => {
  if (!wallets) {
    wallets = Object.values(await getProfiles()).map(({ wallets }) => ({
      ...(wallets.evm as EVMWallet),
    }));
  }
  return wallets;
};

export const operationFolder = async () => {
  const appConfig = await getAppConf();
  return `clusters/${appConfig.cli.cluster_id}`;
};
