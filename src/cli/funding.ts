import conf from "src/conf";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";
import { initFunding } from "src/packages/funding";
import { noFuel, onlyZero } from "src/packages/funding/filters";
import { FundingFilter } from "src/types/funding";

const fFiltersMap: { noFuel: FundingFilter; onlyZero: FundingFilter } = { noFuel, onlyZero };

const filters = conf.cli.funding.filters.map((filter) => fFiltersMap[filter]);

const [minAmount, maxAmount] = conf.cli.funding.depositRange;
const chain = conf.cli.funding.chain;

initFunding(filters, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[chain]);
