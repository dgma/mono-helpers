import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { MS_IN_HOUR } from "src/constants/time";
import { getClient } from "src/libs/clients";
import { getEVMWallets } from "src/libs/configs";
import { getBalance, approve } from "src/libs/erc20";
import { sleepForProperGasPrice } from "src/libs/evm";
import { getRandomArbitrary, sleep } from "src/libs/shared";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

const chain = chains.mainnet;

const approveAndDepositERC = async (wallet: EVMWallet, token: Hex, amount: bigint) => {
  await approve({
    wallet,
    tokenAddress: token,
    spenderAddress: FUEL_POINTS_CONTRACT,
    amount,
    chain,
  });
  const walletClient = await getClient(chain);
  const account = privateKeyToAccount(wallet.pkᵻ);
  const { request } = await walletClient.simulateContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "deposit",
    args: [token, amount, 0x0],
    value: amount,
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  logger.info(`tx hash: ${receipt.transactionHash}`, { label: "fuel::depositERC" });
  return receipt;
};

export async function initERCFuelDeposits(token: Hex) {
  const EVMWallets = await getEVMWallets();

  for (const wallet of EVMWallets) {
    if (wallet === EVMWallets[0]) {
      continue;
    }
    const [, balance] = await getBalance({
      walletAddress: wallet.address,
      tokenAddress: token,
      chain: chain,
    });

    if (balance === 0n) {
      continue;
    }
    await sleepForProperGasPrice();
    await approveAndDepositERC(wallet, token, balance);

    const time = getRandomArbitrary(2 * MS_IN_HOUR, 3 * MS_IN_HOUR);
    logger.info(`sleep for ${time}`, {
      label: "core/distributeERC",
    });
    await sleep(time);
  }
}
