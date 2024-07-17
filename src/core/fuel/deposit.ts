import { zeroAddress, parseEther, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "src/constants/fuel";
import { getPrice } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { decryptMarkedFields } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary, getProfiles, loopUntil } from "src/libs/shared";
import { Profile } from "src/types/profile";

type EVMWallet = { address: `0x${string}`; pkᵻ: `0x${string}` };

const chain = chains.mainnet;
const localClock = new Clock();

const getDecodedEVM = (profiles: Profile, masterKey: string) =>
  Object.values(decryptMarkedFields(profiles, masterKey) as Profile).map(({ wallets }) => ({
    ...(wallets.evm as EVMWallet),
  }));

const deposit = async (wallet: EVMWallet, toDeposit: bigint) => {
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
  // const txHash: `0x${string}` = "0xasdasd";
  console.log(`tx send: ${txHash}`);
  return txHash;
};

type PrepareFnParams = {
  expenses: bigint;
  ethPrice: bigint;
  minDeposit: bigint;
};

const prepare = (params: PrepareFnParams) => async (wallet: EVMWallet) => {
  const publicClient = getPublicClient(chains.mainnet);
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

  const isEligible =
    userBalanceInFuel === 0n && toDeposit > 0n && params.ethPrice * toDeposit >= params.minDeposit * 10n ** 18n;

  return {
    wallet,
    isEligible,
    toDeposit,
  };
};

const getExpenses = async () => {
  const publicClient = getPublicClient(chains.mainnet);
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
const getAccountToDeposit = async (decodedEVMAccounts: ReturnType<typeof getDecodedEVM>, minDeposit: number) => {
  await loopUntil(
    async () => {
      const gasPrice = await getPublicClient(chains.mainnet).getGasPrice();
      return gasPrice < 8000000000n; // 8 gwei
    },
    5 * 60 * 1000,
  );
  const expenses = await getExpenses();
  const ethPrice = await getPrice(getPublicClient(chains.mainnet), chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);
  const eligibleAccounts = await Promise.all(
    decodedEVMAccounts.map(prepare({ expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) })),
  ).then((accounts) => accounts.filter(({ isEligible }) => isEligible));
  console.log("accounts to deposit", eligibleAccounts.length);
  return eligibleAccounts[0];
};

export async function initDeposits(masterKey: string, minDeposit: number) {
  const profiles = getProfiles();
  const decodedEVMAccounts = getDecodedEVM(profiles, masterKey);

  const report: { [prop: string]: { deposited: string; txHash: `0x${string}` } } = {};

  let accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);

  while (accountToDeposit !== undefined) {
    const txHash = await deposit(accountToDeposit.wallet, accountToDeposit.toDeposit);
    report[accountToDeposit.wallet.address] = {
      deposited: formatEther(accountToDeposit.toDeposit),
      txHash,
    };
    localClock.markTime();
    accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, minDeposit);
    await localClock.sleepMax(getRandomArbitrary(3 * 3600000, 5 * 3600000));
  }
}
