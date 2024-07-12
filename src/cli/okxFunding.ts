import { confirm, input, select } from "@inquirer/prompts";
import { OKX_WITHDRAW_CHAINS, SupportedChains } from "src/libs/okx";
import { validatePositiveNumber } from "src/libs/validations";
import { initFunding } from "src/packages/funding";

(async function main() {
  const onlyZero = await confirm({ message: "Fund only zero balances", default: true });
  const fundingChain: SupportedChains = await select({
    message: "Select withdrawal chain",
    choices: [
      {
        name: "Mainnet",
        value: "ETH",
      },
      {
        name: "Arbitrum One",
        value: "ARB",
      },
      {
        name: "Optimism",
        value: "OP",
      },
      {
        name: "Base",
        value: "BASE",
      },
      {
        name: "zkSync Era",
        value: "ZKS",
      },
      {
        name: "Linea",
        value: "LINEA",
      },
      {
        name: "Matic",
        value: "MATIC",
      },
    ],
  });
  const minAmount = await input({ message: "enter minimal usd deposit" }).then(validatePositiveNumber);
  const maxAmount = await input({ message: "enter max usd deposit" }).then(validatePositiveNumber);
  return initFunding(onlyZero, minAmount, maxAmount, OKX_WITHDRAW_CHAINS[fundingChain]);
})();
