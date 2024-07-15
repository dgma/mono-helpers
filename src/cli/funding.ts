import conf from "src/conf";
import { OKX_WITHDRAW_CHAINS } from "src/libs/okx";
import { initFunding } from "src/packages/funding";
import { noFuel, onlyZero } from "src/packages/funding/filters";
import { FundingFilter } from "src/packages/funding/types";

const fFiltersMap: { noFuel: FundingFilter; onlyZero: FundingFilter } = { noFuel, onlyZero };

const filters = conf.packages.funding.filters.map((filter) => fFiltersMap[filter]);

const [minAmount, maxAmount] = conf.packages.funding.depositRange;
const chain = conf.packages.funding.chain;

initFunding(filters, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[chain]);
