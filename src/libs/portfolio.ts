import { formatUnits, Hex } from "viem";
import { Chain } from "viem/chains";
import { TOKENS } from "src/constants/erc20";
import { getPublicClient } from "src/libs/clients";
import { getBalance } from "src/libs/erc20";

const getERC20Portfolio = async (walletAddress: Hex, chain: Chain) => {
  const erc20Tokens = TOKENS[chain.id];

  const report = await Promise.all(
    erc20Tokens.map((tokenAddress) =>
      getBalance({
        walletAddress,
        tokenAddress,
        chain,
      }),
    ),
  );

  return report.filter(([, amount]) => amount > 0n);
};

const getTokensPortfolio = async (walletAddress: Hex, chain: Chain) => {
  const client = await getPublicClient(chain);

  const portfolio = await getERC20Portfolio(walletAddress, chain);

  const ethBalance = await client.getBalance({
    address: walletAddress,
  });

  if (ethBalance > 0n) {
    portfolio.push(["ETH", ethBalance, 18]);
  }

  return portfolio;
};

export const getFormattedPortfolio = async (walletAddress: Hex, chain: Chain) => {
  const portfolio = await getTokensPortfolio(walletAddress, chain);

  return portfolio.reduce(
    (acc, [symbol, amount, decimals]) => {
      acc[symbol] = formatUnits(amount, decimals);
      return acc;
    },
    {} as { [prop: string]: string },
  );
};

export const getPortfolio = async (walletAddress: Hex, chain: Chain) => {
  const portfolio = await getTokensPortfolio(walletAddress, chain);

  return portfolio.reduce(
    (acc, [symbol, amount]) => {
      acc[symbol] = amount;
      return acc;
    },
    {} as { [prop: string]: bigint },
  );
};
