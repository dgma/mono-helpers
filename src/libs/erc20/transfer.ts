import { AxiosInstance } from "axios";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { ERC_20_BASE_ABI } from "src/constants/erc20";
import { getClient } from "src/libs/clients";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

export type TransferProps = {
  wallet: EVMWallet;
  tokenAddress: Hex;
  receiverAddress: Hex;
  amount: bigint;
  axiosInstance?: AxiosInstance;
  chain: chains.Chain;
};

export async function transfer(params: TransferProps) {
  const walletClient = await getClient(params.chain, params.axiosInstance);
  const account = privateKeyToAccount(params.wallet.pkᵻ);
  const { request } = await walletClient.simulateContract({
    address: params.tokenAddress,
    abi: ERC_20_BASE_ABI,
    functionName: "transfer",
    args: [params.receiverAddress, params.amount],
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  logger.info(`tx receipt: ${receipt.transactionHash}`, { label: "erc20/transfer" });
  return receipt;
}
