import { parseEther, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { KELP_POOL_SCROLL_ADDRESS, KELP_POOL_SCROLL_ABI } from "src/constants/kelp";
import { getPrice } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { getEVMWallets } from "src/libs/configs";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary, sleep } from "src/libs/shared";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

const chain = chains.scroll;
const localClock = new Clock();
const minLeft = parseEther(String(getRandomArbitrary(3, 20) / 1000));

const deposit = async (wallet: EVMWallet, toDeposit: bigint) => {
  try {
    const axiosInstance = await refreshProxy();
    const walletClient = await getClient(chain, axiosInstance);
    const account = privateKeyToAccount(wallet.pkᵻ);
    const { request } = await walletClient.simulateContract({
      address: KELP_POOL_SCROLL_ADDRESS,
      abi: KELP_POOL_SCROLL_ABI,
      functionName: "deposit",
      args: ["0xd05723c7b17b4e4c722ca4fb95e64ffc54a70131c75e2b2548a456c51ed7cdaf"],
      value: toDeposit,
      account,
    });
    const txHash = await walletClient.writeContract(request);
    const receipt = await walletClient.waitForTransactionReceipt({
      hash: txHash,
    });
    logger.info(`tx hash: ${receipt.transactionHash}`, { label: "scroll.deposit.kelp" });
    return receipt;
  } catch (error) {
    logger.error((error as Error).message, { label: "scroll.deposit.kelp" });
  }
};

type PrepareFnParams = {
  expenses: bigint;
  ethPrice: bigint;
  minDeposit: bigint;
};

const prepare = (params: PrepareFnParams) => async (wallet: EVMWallet) => {
  const publicClient = await getPublicClient(chain);
  logger.debug(`prepare: ${wallet.address}`, { label: "scroll.deposit.kelp" });
  const userBalanceInKelp = (await publicClient.readContract({
    address: KELP_POOL_SCROLL_ADDRESS,
    abi: KELP_POOL_SCROLL_ABI,
    functionName: "balanceOf",
    args: [wallet.address],
    account: wallet.address,
  })) as bigint;

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  const toDeposit = balance - params.expenses;

  const isEligible =
    userBalanceInKelp * params.ethPrice <= params.minDeposit &&
    toDeposit > 0n &&
    params.ethPrice * toDeposit >= params.minDeposit;

  logger.debug(`isEligible: ${isEligible}`, { label: "scroll.deposit.kelp" });

  return {
    wallet,
    isEligible,
    toDeposit,
  };
};

const getExpenses = async (account: Hex) => {
  const publicClient = await getPublicClient(chain);
  const depositCost = await publicClient.estimateContractGas({
    account,
    address: KELP_POOL_SCROLL_ADDRESS,
    abi: KELP_POOL_SCROLL_ABI,
    functionName: "deposit",
    args: ["0xd05723c7b17b4e4c722ca4fb95e64ffc54a70131c75e2b2548a456c51ed7cdaf"],
    value: 10n,
  });

  return depositCost * 10n * (await publicClient.getGasPrice()) + minLeft;
};

type ProcessedWallets = { [prop: Hex]: true };

const getAccountToDeposit = async (wallets: EVMWallet[], processedWallets: ProcessedWallets, minDeposit: number) => {
  const expenses = await getExpenses(wallets[0].address);
  const ethPrice = await getPrice(
    await getPublicClient(chains.mainnet),
    chainLinkAddresses.ETHUSD[chains.mainnet.id],
    0,
  );
  const makeConfig = prepare({ expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) });
  for (const wallet of wallets) {
    if (!processedWallets[wallet.address]) {
      await sleep(getRandomArbitrary(2500, 5000));
      const config = await makeConfig(wallet);
      if (config.isEligible) {
        return config;
      } else {
        processedWallets[wallet.address] = true;
      }
    }
  }
};

export async function initKelpDeposits(minDeposit: number) {
  const wallets = (await getEVMWallets()).reverse();
  const processedWallets: ProcessedWallets = {};

  let accountToDeposit = await getAccountToDeposit(wallets, processedWallets, minDeposit);

  while (accountToDeposit !== undefined) {
    await deposit(accountToDeposit.wallet, accountToDeposit.toDeposit);
    localClock.markTime();
    accountToDeposit = await getAccountToDeposit(wallets, processedWallets, minDeposit);
    await localClock.sleepMax(getRandomArbitrary(600000, 2 * 600000));
  }
}
