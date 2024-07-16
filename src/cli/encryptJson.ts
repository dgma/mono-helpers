/**
 * Script to encrypt .progiles with masterkay
 */

import { readFileSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { encryptMarkedFields, encrypt } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";
import { JsonValue, JsonObj } from "src/types/common";

(async function main() {
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();
  const doBackup = process.env.BACKUP === "true";

  if (doBackup) {
    await copyFile(file, resolve(".", "encoding.backup.json"));
  }

  const data = JSON.parse(readFileSync(file, "utf-8")) as JsonValue;
  if (typeof data === "object") {
    const encryptedData = encryptMarkedFields(data as JsonObj, masterKey);
    writeFileSync(file, JSON.stringify(encryptedData, null, 2));
  } else {
    writeFileSync(file, encrypt(String(data), masterKey));
  }

  console.log("done");
})();
