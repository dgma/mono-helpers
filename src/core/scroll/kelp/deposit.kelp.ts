import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { KELP_POOL_SCROLL_ADDRESS, KELP_POOL_SCROLL_ABI } from "src/constants/kelp";
import { getPrice } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { getProfiles } from "src/libs/configs";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary, loopUntil } from "src/libs/shared";
import { EVMWallet } from "src/types/configs";

const chain = chains.scroll;
const localClock = new Clock();

const deposit = async (wallet: EVMWallet, toDeposit: bigint) => {
  const axiosInstance = await refreshProxy();
  const walletClient = await getClient(chain, axiosInstance);
  const account = privateKeyToAccount(wallet.pkᵻ);
  const { request } = await walletClient.simulateContract({
    address: KELP_POOL_SCROLL_ADDRESS,
    abi: KELP_POOL_SCROLL_ABI,
    functionName: "deposit",
    value: toDeposit,
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log(`tx hash: ${receipt.transactionHash}`);
  return receipt;
};

type PrepareFnParams = {
  expenses: bigint;
  ethPrice: bigint;
  minDeposit: bigint;
};

const prepare = (params: PrepareFnParams) => async (wallet: EVMWallet) => {
  const publicClient = await getPublicClient(chain);
  const userBalanceInKelp = await publicClient.readContract({
    address: KELP_POOL_SCROLL_ADDRESS,
    abi: KELP_POOL_SCROLL_ABI,
    functionName: "balanceOf",
    args: [wallet.address],
  });

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  const toDeposit = balance - params.expenses;

  const isEligible = userBalanceInKelp === 0n && toDeposit > 0n && params.ethPrice * toDeposit >= params.minDeposit;

  return {
    wallet,
    isEligible,
    toDeposit,
  };
};

const getExpenses = async (account: `0x${string}`) => {
  const publicClient = await getPublicClient(chain);
  const depositCost = await publicClient.estimateContractGas({
    account,
    address: KELP_POOL_SCROLL_ADDRESS,
    abi: KELP_POOL_SCROLL_ABI,
    functionName: "deposit",
    args: ["0xd05723c7b17b4e4c722ca4fb95e64ffc54a70131c75e2b2548a456c51ed7cdaf"],
    value: 10n,
  });

  return depositCost * 10n * (await publicClient.getGasPrice());
};

const getAccountToDeposit = async (wallets: EVMWallet[], minDeposit: number) => {
  await loopUntil(
    async () => {
      const gasPrice = await (await getPublicClient(chain)).getGasPrice();
      return gasPrice < 8000000000n; // 8 gwei
    },
    5 * 60 * 1000,
  );
  const expenses = await getExpenses(wallets[0].address);
  const ethPrice = await getPrice(
    await getPublicClient(chains.mainnet),
    chainLinkAddresses.ETHUSD[chains.mainnet.id],
    0,
  );
  const eligibleAccounts = await Promise.all(
    wallets.map(prepare({ expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) })),
  ).then((accounts) => accounts.filter(({ isEligible }) => isEligible));
  console.log("accounts to deposit", eligibleAccounts.length);
  return eligibleAccounts[0];
};

export async function initKelpDeposits(minDeposit: number) {
  const profiles = await getProfiles();
  const decodedEVMAccounts = Object.values(profiles).map(({ wallets }) => ({
    ...(wallets.evm as EVMWallet),
  }));

  let accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);

  while (accountToDeposit !== undefined) {
    await deposit(accountToDeposit.wallet, accountToDeposit.toDeposit);
    localClock.markTime();
    accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);
    await localClock.sleepMax(getRandomArbitrary(2 * 3600000, 4 * 3600000));
  }
}
