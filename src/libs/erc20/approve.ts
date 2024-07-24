import { AxiosInstance } from "axios";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { ERC_20_BASE_ABI } from "src/constants/erc20";
import { getClient } from "src/libs/clients";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

export type ApproveSpendingParams = {
  wallet: EVMWallet;
  tokenAddress: Hex;
  spenderAddress: Hex;
  amount: bigint;
  axiosInstance?: AxiosInstance;
  chain: chains.Chain;
};

export async function approve(params: ApproveSpendingParams) {
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
  logger.debug(`tx receipt: ${receipt}`, { label: "approve" });
  return receipt;
}
