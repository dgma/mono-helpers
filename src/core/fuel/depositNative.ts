import { zeroAddress, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { MS_IN_HOUR } from "src/constants/time";
import { getPrice } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import { getEVMWallets } from "src/libs/configs";
import { sleepForProperGasPrice } from "src/libs/evm";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary, sleep } from "src/libs/shared";
import { logger } from "src/logger";
import { EVMWallet } from "src/types/configs";

const chain = chains.mainnet;

const depositNative = async (wallet: EVMWallet, toDeposit: bigint) => {
  const axiosInstance = await refreshProxy();
  const walletClient = await getClient(chain, axiosInstance);
  const account = privateKeyToAccount(wallet.pkᵻ);
  const { request } = await walletClient.simulateContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "deposit",
    args: [zeroAddress, toDeposit, 0x0],
    value: toDeposit,
    account,
  });
  const txHash = await walletClient.writeContract(request);
  const receipt = await walletClient.waitForTransactionReceipt({
    hash: txHash,
  });
  logger.info(`tx hash: ${receipt.transactionHash}`, { label: "fuel::depositNative" });
  return receipt;
};

type PrepareFnParams = {
  expenses: bigint;
  ethPrice: bigint;
  minDeposit: bigint;
};

const prepare = (params: PrepareFnParams) => async (wallet: EVMWallet) => {
  const publicClient = await getPublicClient(chains.mainnet);
  const userBalanceInFuel = await publicClient.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [wallet.address, zeroAddress],
  });

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  const toDeposit = balance - params.expenses;

  const isEligible = userBalanceInFuel === 0n && toDeposit > 0n && params.ethPrice * toDeposit >= params.minDeposit;

  return {
    wallet,
    isEligible,
    toDeposit,
  };
};

const getExpenses = async () => {
  const publicClient = await getPublicClient(chains.mainnet);
  const depositCost = await publicClient.estimateContractGas({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "deposit",
    args: [zeroAddress, 0n, 0],
    value: 10n,
  });

  const withdrawCost = await publicClient.estimateContractGas({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "withdraw",
    args: [zeroAddress, zeroAddress, 0n],
  });

  return (depositCost + withdrawCost) * 5n * (await publicClient.getGasPrice());
};

// TODO: pass gas config
const getAccountToDeposit = async (decodedEVMAccounts: EVMWallet[], minDeposit: number) => {
  await sleepForProperGasPrice();
  const expenses = await getExpenses();
  const ethPrice = await getPrice(
    await getPublicClient(chains.mainnet),
    chainLinkAddresses.ETHUSD[chains.mainnet.id],
    0,
  );
  const eligibleAccounts = await Promise.all(
    decodedEVMAccounts.map(prepare({ expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) })),
  ).then((accounts) => accounts.filter(({ isEligible }) => isEligible));
  logger.info(`accounts to deposit ${eligibleAccounts.length}`, { label: "fuel::depositNative" });
  return eligibleAccounts[0];
};

export async function initNativeFuelDeposits(minDeposit: number) {
  const decodedEVMAccounts = await getEVMWallets();

  let accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);

  while (accountToDeposit !== undefined) {
    await depositNative(accountToDeposit.wallet, accountToDeposit.toDeposit);
    accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);
    const time = getRandomArbitrary(1 * MS_IN_HOUR, 2 * MS_IN_HOUR);
    logger.info(`sleep for ${time}`, {
      label: "core/depositNative",
    });
    await sleep(time);
  }
}
