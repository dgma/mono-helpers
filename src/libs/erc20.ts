import { AxiosInstance } from "axios";
import { getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { ERC_20_BASE_ABI } from "src/constants/erc20";
import { getClient, getPublicClient } from "src/libs/clients";
import { EVMWallet } from "src/types/configs";

export type ApproveSpendingParams = {
  wallet: EVMWallet;
  tokenAddress: `0x${string}`;
  spenderAddress: `0x${string}`;
  amount: bigint;
  axiosInstance?: AxiosInstance;
  chain: chains.Chain;
};

export async function Approve(params: ApproveSpendingParams) {
  const walletClient = await getClient(params.chain, params.axiosInstance);
  const account = privateKeyToAccount(params.wallet.pkᵻ);
  const { request } = await walletClient.simulateContract({
    address: params.tokenAddress,
    abi: ERC_20_BASE_ABI,
    functionName: "approve",
    args: [params.spenderAddress, params.amount],
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log(`tx receipt: ${receipt}`);
  return receipt;
}

export type GetBalanceParams = {
  walletAddress: `0x${string}`;
  tokenAddress: `0x${string}`;
  chain: chains.Chain;
};

export const getBalance = async (params: GetBalanceParams) => {
  const client = await getPublicClient(params.chain);

  const contract = getContract({
    address: params.tokenAddress,
    abi: ERC_20_BASE_ABI,
    client,
  });
  const symbol = await contract.read.symbol();
  const amount = await contract.read.balanceOf([params.walletAddress]);
  const decimals = await contract.read.decimals();
  return [symbol, amount, decimals] as const;
};
