import { AxiosInstance } from "axios";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem/chains";
import { MILLER_ABI } from "src/constants/miller";
import { getClient } from "src/libs/clients";
import { signPermit } from "src/libs/erc20";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

type distributeERC20Props = {
  chain: Chain;
  axiosInstance: AxiosInstance;
  tokenAddress: Hex;
  millerAddress: Hex;
  wallet: EVMWallet;
  config: { amount: bigint; to: Hex }[];
  permitValue: bigint;
};

export const distributeERC20 = async (props: distributeERC20Props) => {
  const permit = await signPermit({
    contractAddress: props.tokenAddress,
    spenderAddress: props.millerAddress,
    deadline: 120n, // ~10 blocks
    chain: props.chain,
    wallet: props.wallet,
    value: props.permitValue,
  });

  const account = privateKeyToAccount(props.wallet.pkᵻ);
  const client = await getClient(props.chain, props.axiosInstance);
  const { request } = await client.simulateContract({
    address: props.millerAddress,
    abi: MILLER_ABI,
    functionName: "distributeERC20",
    args: [props.config, props.tokenAddress, props.permitValue, 120n, permit.v, permit.r, permit.s],
    account,
  });
  const txHash = await client.writeContract(request);
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash,
  });
  logger.debug(`tx receipt: ${receipt}`, { label: "distributeERC20" });
};
