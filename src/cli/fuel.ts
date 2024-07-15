import { password } from "@inquirer/prompts";
import conf from "src/conf";
import { initDeposits } from "src/core/fuel";

const key = await password({ message: "Enter master key" });

await initDeposits(key, conf.cli.fuel.minDeposit);
