import { readFileSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { decryptJson } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("decrypt script initiated");
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();
  const doBackup = process.env.BACKUP === "true";

  if (doBackup) {
    await copyFile(file, resolve(".", "encoded.backup.json"));
  }

  const decryptedJson = decryptJson(readFileSync(file, "utf-8"), masterKey);
  writeFileSync(file, JSON.stringify(decryptedJson, null, 2));

  console.log("decrypt script finished");
})();
