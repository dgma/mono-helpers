import { getContract, formatUnits } from "viem";
import { Chain } from "viem/chains";
import { TOKENS, ERC_20_BASE_ABI } from "src/constants/erc20";
import { getPublicClient } from "src/libs/clients";

const getERC20ContractFor = async (contractAddress: `0x${string}`, chain: Chain) => {
  const client = await getPublicClient(chain);

  return getContract({
    address: contractAddress,
    abi: ERC_20_BASE_ABI,
    client,
  });
};

const getERC20Portfolio = async (walletAddress: `0x${string}`, chain: Chain) => {
  const erc20Tokens = TOKENS[chain.id];

  const report = await Promise.all(
    erc20Tokens.map(async (tokenAddress) => {
      const contract = await getERC20ContractFor(tokenAddress, chain);
      const symbol = await contract.read.symbol();
      const amount = await contract.read.balanceOf([walletAddress]);
      const decimals = await contract.read.decimals();
      return [symbol, amount, decimals] as const;
    }),
  );

  return report.filter(([, amount]) => amount > 0n);
};

const getTokensPortfolio = async (walletAddress: `0x${string}`, chain: Chain) => {
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

export const getFormattedPortfolio = async (walletAddress: `0x${string}`, chain: Chain) => {
  const portfolio = await getTokensPortfolio(walletAddress, chain);

  return portfolio.reduce(
    (acc, [symbol, amount, decimals]) => {
      acc[symbol] = formatUnits(amount, decimals);
      return acc;
    },
    {} as { [prop: string]: string },
  );
};

export const getPortfolio = async (walletAddress: `0x${string}`, chain: Chain) => {
  const portfolio = await getTokensPortfolio(walletAddress, chain);

  return portfolio.reduce(
    (acc, [symbol, amount]) => {
      acc[symbol] = amount;
      return acc;
    },
    {} as { [prop: string]: bigint },
  );
};
