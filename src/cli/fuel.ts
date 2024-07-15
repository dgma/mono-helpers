import { Command, Option } from "@commander-js/extra-typings";
import conf from "src/conf";
import { initDeposits } from "src/packages/fuel";

new Command()
  .addOption(new Option("-k, --key <masterKey>").makeOptionMandatory())
  .action(({ key }) => initDeposits(key, conf.cli.fuel.minDeposit))
  .parseAsync();
