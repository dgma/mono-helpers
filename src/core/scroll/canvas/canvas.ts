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
import { EVMWallet } from "src/types/configs";

const chain = chains.scroll;
const localClock = new Clock();
const mintCost = parseEther("0.001");
const testUserName = hash("superUniqRandomUserName123456789!@£$");

const isUsernameUsed = async (userName: string) =>
  (await getPublicClient(chain)).readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isUsernameUsed",
    args: [userName],
  });

const gerAvailableNickName = async (axiosInstance: AxiosInstance) => {
  const name = await getName(axiosInstance);
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
    args: [name, 0x0],
    value: mintCost,
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log(`name: tx receipt: ${receipt}`);
  return receipt;
};

const prepare = (expenses: bigint) => async (wallet: EVMWallet) => {
  const publicClient = await getPublicClient(chain);
  const isProfileMinted = await publicClient.readContract({
    address: CANVAS_ADDRESS,
    abi: CANVAS_ABI,
    functionName: "isProfileMinted",
    args: [wallet.address],
  });

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
    args: [testUserName, 0x0],
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
  console.log("mint canvas nft fot ", eligibleAccounts.length);
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
