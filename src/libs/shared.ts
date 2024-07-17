import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { password } from "@inquirer/prompts";
import { Profile } from "src/types/profile";

export const sleep = (time: number = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

export const getRandomArbitrary = (min: number, max: number) => {
  if (max <= min) {
    throw new Error("max should be above min");
  }
  return Math.random() * (max - min) + min;
};

let profiles: Profile;

export const getProfiles = () => {
  if (!profiles) {
    profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;
  }
  return profiles;
};

export const saveInFolder = (savePath: string, data: string) => {
  const parsedPath = savePath.split("/");
  const clearPath = parsedPath
    .slice(0, -1)
    .filter((folderName) => !!folderName)
    .join("/");
  if (!existsSync(clearPath)) {
    mkdirSync(clearPath);
  }
  writeFileSync(savePath, data);
};

let masterKey: string;

const readMasterKey = async () =>
  existsSync("/run/secrets/master_key")
    ? readFileSync(resolve("/run/secrets/master_key"), "utf-8").trimEnd()
    : await password({ message: "Enter master key" });

export const getMasterKey = async () => {
  if (!masterKey) {
    masterKey = await readMasterKey();
  }
  return masterKey;
};

export const loopUntil = async (condition: () => Promise<boolean>, pause: number) => {
  let isConditionAchieved = await condition();
  while (!isConditionAchieved) {
    console.log("loopUntil", pause);
    await sleep(pause);
    isConditionAchieved = await condition();
  }
  return isConditionAchieved;
};
