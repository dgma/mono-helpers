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
import { getRandomArbitrary } from "src/libs/shared";
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
  while (isUsernameUsed(`${name}_${number}`)) {
    number = getRandomArbitrary(12, 1000);
  }
  return `${name}_${number}`;
};

const mint = async (wallet: EVMWallet) => {
  const axiosInstance = await refreshProxy();
  const walletClient = await getClient(chain, axiosInstance);
  const account = privateKeyToAccount(wallet.pkᵻ);
  const name = await gerAvailableNickName(axiosInstance);
  const { request } = await walletClient.simulateContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "deposit",
    args: [name, ""],
    value: mintCost,
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  logger.info(`name: ${name}, tx hash: ${receipt.transactionHash}`, { label: "canvas" });
  return receipt;
};

const prepare = (expenses: bigint) => async (wallet: EVMWallet) => {
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

  logger.info(`isProfileMinted: ${isProfileMinted}`, { label: "canvas" });

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  const isEligible = !isProfileMinted && balance > expenses;

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

const filterNotEligible = (
  accounts: {
    wallet: EVMWallet;
    isEligible: boolean;
  }[],
) => accounts.filter(({ isEligible }) => isEligible);

const getAccountToMint = async (wallets: EVMWallet[]) => {
  const expenses = await getExpenses();
  const eligibleAccounts = await Promise.all(wallets.map(prepare(expenses))).then(filterNotEligible);
  logger.info(`mint canvas nft for ${eligibleAccounts.length}`, { label: "canvas" });
  return eligibleAccounts[0];
};

export async function initiateMinting() {
  const wallets = await getEVMWallets();

  let accountToMint = await getAccountToMint(wallets);

  while (accountToMint !== undefined) {
    await mint(accountToMint.wallet);
    localClock.markTime();
    accountToMint = await getAccountToMint(wallets);
    await localClock.sleepMax(getRandomArbitrary(3 * 3600000, 5 * 3600000));
  }
}
