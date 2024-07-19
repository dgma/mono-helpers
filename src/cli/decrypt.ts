import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { decryptJson } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";
import { logger } from "src/logger";

(async function main() {
  logger.info("initiated", { label: "CLI::decrypt" });
  const file = resolve(".", process.env.FILE as string);
  const masterKey = await getMasterKey();

  const decryptedJson = decryptJson(readFileSync(file, "utf-8"), masterKey);
  const output = resolve(".", process.env.OUTPUT as string);
  writeFileSync(output, JSON.stringify(decryptedJson, null, 2));

  logger.info("finished", { label: "CLI::decrypt" });
})();
