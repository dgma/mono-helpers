import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
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

export const getProfiles = () => JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;

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
