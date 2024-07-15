import { password } from "@inquirer/prompts";
import conf from "src/conf";
import { createProfiles } from "src/core/profiles";

const key = await password({ message: "Enter master key" });

await createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains, key);
