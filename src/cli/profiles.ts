import { Command, Option } from "@commander-js/extra-typings";
import conf from "src/conf";
import { createProfiles } from "src/core/profiles";

new Command()
  .addOption(new Option("-k, --key <masterKey>").makeOptionMandatory())
  .action(({ key }) => createProfiles(conf.cli.profiles.amount, conf.cli.profiles.chains, key))
  .parseAsync();
