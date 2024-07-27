import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { getClient, getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { getEVMWallets } from "src/libs/configs";
import { getBalance, approve } from "src/libs/erc20";
import { getRandomArbitrary, loopUntil } from "src/libs/shared";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

const chain = chains.mainnet;
const localClock = new Clock();

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

const sleepForProperGasPrice = async () =>
  await loopUntil(
    async () => {
      const gasPrice = await (await getPublicClient(chains.mainnet)).getGasPrice();
      return gasPrice < 8000000000n; // 8 gwei
    },
    5 * 60 * 1000,
  );

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
    localClock.markTime();
    await sleepForProperGasPrice();
    await approveAndDepositERC(wallet, token, balance);

    await localClock.sleepMax(getRandomArbitrary(1 * 3_600_000, 2 * 3_600_000));
  }
}
