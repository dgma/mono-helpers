import { password } from "@inquirer/prompts";
import conf from "src/conf";
import { recoverProfiles } from "src/core/profiles";

const key = await password({ message: "Enter master key" });

await recoverProfiles(conf.cli.profiles.chains, key);
