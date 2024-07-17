import { readFileSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { encrypt } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("encrypt script initiated");
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();
  const doBackup = process.env.BACKUP === "true";

  if (doBackup) {
    await copyFile(file, resolve(".", "decoded.backup.json"));
  }

  writeFileSync(file, encrypt(readFileSync(file, "utf-8"), masterKey));

  console.log("encrypt script finished");
})();
