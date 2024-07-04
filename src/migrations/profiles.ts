/**
 * Script to migrate from legacy generated files to profiles
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Profile, Wallet } from "src/types/profile";

type LegacyWallet = Wallet & { mnemonicᵻ?: string };

const wallets = JSON.parse(readFileSync(resolve(".", ".wallet.json"), "utf-8")) as LegacyWallet[];

const profile = wallets.reduce((acc: Profile, item, i) => {
  const mn = item["mnemonicᵻ"]!;
  delete item["mnemonicᵻ"];
  acc[i] = {
    mnemonicᵻ: mn,
    wallets: item,
  };
  return acc;
}, {});

writeFileSync(".profiles.json", JSON.stringify(profile, null, 2));
