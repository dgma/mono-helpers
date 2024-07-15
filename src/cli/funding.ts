import { Command, Option } from "@commander-js/extra-typings";
import { OKX_WITHDRAW_CHAINS } from "src/libs/okx";
import { initFunding } from "src/packages/funding";
import { noFuel, onlyZero } from "src/packages/funding/filters";
import { FundingFilter } from "src/packages/funding/types";

const opts = new Command()
  .addOption(
    new Option("-c, --chain <chain>")
      .choices(["eth", "arb", "op", "base", "zks", "linea", "matic"] as const)
      .makeOptionMandatory(),
  )
  .addOption(
    new Option("-f, --filters <filters>").choices(["noFuel", "onlyZero", "void"] as const).makeOptionMandatory(),
  )
  .addOption(new Option("-r, --range <range>").makeOptionMandatory())
  .parse()
  .opts();

const fFiltersMap: { [prop: string]: FundingFilter } = { noFuel, onlyZero, void: async () => true };

const filters = opts.filters ? opts.filters.split(",").map((filter) => fFiltersMap[filter]) : [];
const [minAmount, maxAmount] = opts.range.split("-").map(Number);

initFunding(filters, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[opts.chain as keyof typeof OKX_WITHDRAW_CHAINS]);
