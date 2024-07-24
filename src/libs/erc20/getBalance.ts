import { Hex } from "viem";
import * as chains from "viem/chains";
import { ERC_20_BASE_ABI } from "src/constants/erc20";
import { getPublicClient } from "src/libs/clients";

export type GetBalanceParams = {
  walletAddress: Hex;
  tokenAddress: Hex;
  chain: chains.Chain;
};

export const getBalance = async (params: GetBalanceParams) => {
  const client = await getPublicClient(params.chain);

  const contract = {
    address: params.tokenAddress,
    abi: ERC_20_BASE_ABI,
  };

  const [symbol, amount, decimals] = await client.multicall({
    contracts: [
      {
        ...contract,
        functionName: "symbol",
      },
      {
        ...contract,
        functionName: "balanceOf",
        args: [params.walletAddress],
      },
      {
        ...contract,
        functionName: "decimals",
      },
    ],
  });

  return [symbol.result!, amount.result!, decimals.result!] as const;
};
