import readConf from "src/conf";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";
import { initFunding } from "src/core/funding";
import { noFuel, onlyZero, lteBalance } from "src/core/funding/filters";
import { FundingFilter } from "src/types/funding";

(async function main() {
  console.log("funding script initiated");
  const conf = await readConf();
  const fFiltersMap: { noFuel: FundingFilter; onlyZero: FundingFilter; lteBalance: FundingFilter } = {
    noFuel,
    onlyZero,
    lteBalance: lteBalance(conf.cli.funding.lteBalance),
  };

  const filters = conf.cli.funding.filters.map((filter) => fFiltersMap[filter]);

  const [minAmount, maxAmount] = conf.cli.funding.depositRange;
  const chain = conf.cli.funding.chain;
  await initFunding(filters, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[chain]);
  console.log("funding script finished");
})();
