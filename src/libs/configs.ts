import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decryptJson } from "./crypt";
import { getMasterKey } from "./shared";
import { AppConfig, Profile } from "src/types/configs";

let config: AppConfig;

export const getAppConf = async () => {
  if (!config) {
    const masterKey = await getMasterKey();
    config = decryptJson(readFileSync(resolve(".", ".app.config"), "utf-8"), masterKey) as AppConfig;
  }
  return config;
};

let profiles: Profile;

export const getProfiles = async () => {
  if (!profiles) {
    const masterKey = await getMasterKey();
    profiles = decryptJson(readFileSync(resolve(".", ".profiles"), "utf-8"), masterKey) as Profile;
  }
  return profiles;
};
