/**
 * Script to encrypt .progiles with masterkay
 */

import { readFileSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { password, confirm } from "@inquirer/prompts";
import { encryptMarkedFields } from "src/libs/crypt";
import { Profile } from "src/types/profile";

(async function main() {
  const file = resolve(".", ".profiles.json");
  const masterKey = await password({ message: "enter encryption master key", mask: false });
  const doBackup = await confirm({ message: "make backup before encryption?", default: true });

  if (doBackup) {
    await copyFile(file, resolve(".", ".profiles.backup.json"));
  }

  const profiles = JSON.parse(readFileSync(file, "utf-8")) as Profile;
  const clearedProfiles = Object.entries(profiles).reduce((acc: Profile, [key, value]) => {
    acc[key] = encryptMarkedFields(value, masterKey) as Profile[string];
    return acc;
  }, {});

  writeFileSync(".profiles.json", JSON.stringify(clearedProfiles, null, 2));

  console.log("done");
})();
