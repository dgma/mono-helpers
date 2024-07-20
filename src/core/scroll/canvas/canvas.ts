import { AxiosInstance } from "axios";
import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { CANVAS_ADDRESS, CANVAS_ABI } from "src/constants/canvas";
import { getClient, getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { getEVMWallets } from "src/libs/configs";
import { hash } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { getName } from "src/libs/randommer";
import { getRandomArbitrary, sleep } from "src/libs/shared";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

const chain = chains.scroll;
const localClock = new Clock();
const mintCost = parseEther("0.001");
const testUserName = hash("superUniqRandom", 15);

const isUsernameUsed = async (userName: string) =>
  (await getPublicClient(chain)).readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isUsernameUsed",
    args: [userName],
  });

const gerAvailableNickName = async (axiosInstance: AxiosInstance) => {
  const rawName = await getName(axiosInstance);
  const name = rawName.length > 12 ? rawName.substring(0, 12) : rawName;
  let number = getRandomArbitrary(12, 1000);
  while (await isUsernameUsed(`${name}_${number}`)) {
    number = getRandomArbitrary(12, 1000);
  }
  return `${name}_${number}`;
};

const mint = async (wallet: EVMWallet) => {
  try {
    const axiosInstance = await refreshProxy(0);
    const walletClient = await getClient(chain, axiosInstance);
    const account = privateKeyToAccount(wallet.pkᵻ);
    console.info(`mint for ${account.address}`, { label: "canvas" });
    const name = await gerAvailableNickName(axiosInstance);
    const { request } = await walletClient.simulateContract({
      address: CANVAS_ADDRESS,
      abi: CANVAS_ABI,
      functionName: "mint",
      args: [name, ""],
      value: mintCost,
      account,
      chain,
    });
    const txHash = await walletClient.writeContract(request);
    const receipt = await walletClient.waitForTransactionReceipt({
      hash: txHash,
    });
    logger.info(`name: ${name}, tx hash: ${receipt.transactionHash}`, { label: "canvas" });
    return receipt;
  } catch (error) {
    logger.error((error as Error).message, { label: "canvas" });
  }
};

const prepare = (expenses: bigint) => async (wallet: EVMWallet) => {
  logger.debug(`prepare: ${wallet.address}`, { label: "canvas" });
  const publicClient = await getPublicClient(chain);
  const profile = await publicClient.readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "getProfile",
    args: [wallet.address],
  });
  const isProfileMinted = await publicClient.readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isProfileMinted",
    args: [profile],
  });

  logger.debug(`isProfileMinted: ${isProfileMinted}`, { label: "canvas" });

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  const isEligible = !isProfileMinted && balance > expenses;

  logger.debug(`isEligible: ${isEligible}`, { label: "canvas" });

  return {
    wallet,
    isEligible,
  };
};

const getExpenses = async () => {
  const publicClient = await getPublicClient(chain);
  const gasPrice = await publicClient.getGasPrice();
  const mintGasCost = await publicClient.estimateContractGas({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "mint",
    args: [testUserName, ""],
    value: mintCost,
  });
  return mintGasCost * gasPrice + mintCost;
};

type ProcessedWallets = { [prop: `0x${string}`]: true };

const getAccountToMint = async (wallets: EVMWallet[], processedWallets: ProcessedWallets) => {
  const expenses = await getExpenses();
  const makeConfig = prepare(expenses);
  for (const wallet of wallets) {
    if (!processedWallets[wallet.address]) {
      await sleep(1500);
      const config = await makeConfig(wallet);
      if (config.isEligible) {
        return config;
      } else {
        processedWallets[wallet.address] = true;
      }
    }
  }
};

export async function initiateMinting() {
  const wallets = (await getEVMWallets()).reverse();
  const processedWallets: ProcessedWallets = {};

  let accountToMint = await getAccountToMint(wallets, processedWallets);

  while (accountToMint !== undefined) {
    await mint(accountToMint.wallet);
    localClock.markTime();
    accountToMint = await getAccountToMint(wallets, processedWallets);
    await localClock.sleepMax(getRandomArbitrary(600000, 2 * 600000));
  }
}
