import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { encrypt } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";

(async function main() {
  console.log("encrypt script initiated");
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();

  const output = resolve(".", process.env.OUTPUT as string);
  writeFileSync(output, encrypt(readFileSync(file, "utf-8"), masterKey));

  console.log("encrypt script finished");
})();
