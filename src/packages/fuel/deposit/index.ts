import { zeroAddress, parseEther, PublicClient, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "../constants";
import { getPrice, chainLinkAddresses } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import { decryptMarkedFields } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary, sleep, saveInFolder, getProfiles } from "src/libs/shared";
import { Profile } from "src/types/profile";

type EVMWallet = { address: `0x${string}`; pkᵻ: `0x${string}` };

const chain = chains.mainnet;

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
  console.log(`tx send: ${txHash}`);
  return txHash;
};

type PrepareFnParams = {
  publicClient: PublicClient;
  expenses: bigint;
  ethPrice: bigint;
  minDeposit: bigint;
};

const prepare = (params: PrepareFnParams) => async (wallet: EVMWallet) => {
  const userBalanceInFuel = await params.publicClient.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [wallet.address, zeroAddress],
  });

  const balance = await params.publicClient.getBalance({
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

const getExpenses = async (publicClient: PublicClient) => {
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

const getAccountToDeposit = async (
  decodedEVMAccounts: ReturnType<typeof getDecodedEVM>,
  publicClient: PublicClient,
  minDeposit: number,
) => {
  const expenses = await getExpenses(publicClient);
  const ethPrice = await getPrice(publicClient, chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);
  return Promise.all(
    decodedEVMAccounts.map(prepare({ publicClient, expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) })),
  ).then((accounts) => accounts.find(({ isEligible }) => isEligible));
};

export async function initDeposits(masterKey: string, minDeposit: number) {
  const profiles = getProfiles();
  const decodedEVMAccounts = getDecodedEVM(profiles, masterKey);
  const publicClient = getPublicClient(chains.mainnet);

  const report: { [prop: string]: { deposited: string; txHash: `0x${string}` } } = {};

  let accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, publicClient, minDeposit);

  while (accountToDeposit !== undefined) {
    const txHash = await deposit(accountToDeposit.wallet, accountToDeposit.toDeposit);
    report[accountToDeposit.wallet.address] = {
      deposited: formatEther(accountToDeposit.toDeposit),
      txHash,
    };
    const pauseMs = getRandomArbitrary(3 * 3600000, 5 * 3600000);
    console.log("sleep for", pauseMs);
    await sleep(pauseMs);
    accountToDeposit = await getAccountToDeposit(decodedEVMAccounts, publicClient, minDeposit);
  }
  saveInFolder(
    "./reports/withdrawals.report.json",
    JSON.stringify(
      {
        [new Date().toISOString()]: report,
      },
      null,
      2,
    ),
  );
}
