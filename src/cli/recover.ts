import { Command, Option } from "@commander-js/extra-typings";
import conf from "src/conf";
import { recoverProfiles } from "src/core/profiles";

new Command()
  .addOption(new Option("-k, --key <masterKey>").makeOptionMandatory())
  .action(({ key }) => recoverProfiles(conf.cli.profiles.chains, key))
  .parseAsync();
