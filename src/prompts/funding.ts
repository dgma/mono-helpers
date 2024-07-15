import { input, select, confirm } from "@inquirer/prompts";
import { OKX_WITHDRAW_CHAINS, SupportedChains } from "src/libs/okx";
import { validatePositiveNumber } from "src/libs/validations";
import { initFunding } from "src/packages/funding";
import { noFuel, onlyZero } from "src/packages/funding/filters";

const selectFilters = async () => {
  const filters = [];
  let choices = [
    {
      name: "No fuel deposits",
      value: noFuel,
    },
    {
      name: "Only zero balances",
      value: onlyZero,
    },
  ];
  let addFilter = await confirm({ message: "Add account selection criteria?", default: false });
  while (addFilter) {
    const filter = await select({
      message: "Select criteria",
      choices: choices,
    });
    filters.push(filter);
    choices = choices.filter(({ value }) => value !== filter);
    if (choices.length > 0) {
      addFilter = await confirm({ message: "Add more account selection criteria?", default: false });
    } else {
      addFilter = false;
    }
  }
  return filters;
};

(async function main() {
  const fundingChain: SupportedChains = await select({
    message: "Select withdrawal chain",
    choices: [
      {
        name: "Mainnet",
        value: "eth",
      },
      {
        name: "Arbitrum One",
        value: "arb",
      },
      {
        name: "Optimism",
        value: "op",
      },
      {
        name: "Base",
        value: "base",
      },
      {
        name: "zkSync Era",
        value: "zks",
      },
      {
        name: "Linea",
        value: "linea",
      },
      {
        name: "Matic",
        value: "matic",
      },
    ],
  });
  const filters = await selectFilters();
  const minAmount = await input({ message: "enter minimal wallet balance after top up in usd" }).then(
    validatePositiveNumber,
  );
  const maxAmount = await input({ message: "enter maximum wallet balance after top up in usd" }).then(
    validatePositiveNumber,
  );
  return initFunding(filters, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[fundingChain]);
})();
