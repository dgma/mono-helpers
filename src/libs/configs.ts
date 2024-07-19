import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decryptJson } from "./crypt";
import { getMasterKey } from "./shared";
import { JsonObj } from "src/types/common";
import { AppConfig, Profile } from "src/types/configs";

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
    const masterKey = await getMasterKey();
    profiles = decryptJson(readFileSync(resolve(".", ".profiles"), "utf-8").trimEnd(), masterKey) as Profile;
  }
  return profiles;
};
