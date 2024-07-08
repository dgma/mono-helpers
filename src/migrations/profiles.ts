/**
 * Script to migrate from legacy generated files to profiles
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { password } from "@inquirer/prompts";
import { encryptMarkedFields } from "src/libs/crypt";
import { Profile, Wallet } from "src/types/profile";

type LegacyWallet = Wallet & { mnemonicᵻ?: string };

(async function main() {
  const masterKey = await password({ message: "enter encryption master key", mask: false });

  const wallets = JSON.parse(readFileSync(resolve(".", ".wallets.json"), "utf-8")) as LegacyWallet[];

  const profile = wallets.reduce((acc: Profile, item, i) => {
    const mn = item["mnemonicᵻ"]!;
    delete item["mnemonicᵻ"];
    acc[i] = encryptMarkedFields(
      {
        mnemonicᵻ: mn,
        wallets: item,
      },
      masterKey,
    ) as Profile[string];
    return acc;
  }, {});

  writeFileSync(resolve(".", ".profiles.json"), JSON.stringify(profile, null, 2));

  console.log("done");
})();
