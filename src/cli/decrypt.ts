import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { decryptJson } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("decrypt script initiated");
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();

  const decryptedJson = decryptJson(readFileSync(file, "utf-8"), masterKey);
  const output = resolve(".", process.env.OUTPUT as string);
  writeFileSync(output, JSON.stringify(decryptedJson, null, 2));

  console.log("decrypt script finished");
})();
