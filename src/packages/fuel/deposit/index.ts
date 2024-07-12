import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { zeroAddress, parseEther, PublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "./constants";
import { getPrice, chainLinkAddresses } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import { decryptMarkedFields } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { getRandomArbitrary } from "src/libs/shared";
import { Profile } from "src/types/profile";

type EVMWallet = { address: `0x${string}`; pkᵻ: `0x${string}` };

const chain = chains.mainnet;

const getDecodedEVM = (profiles: Profile, masterKey: string) =>
  Object.values(decryptMarkedFields(profiles, masterKey) as Profile).map(({ wallets }) => ({
    ...(wallets.evm as EVMWallet),
  }));

const deposit = (wallet: EVMWallet, toDeposit: bigint) => async () => {
  const axiosInstance = await refreshProxy(getRandomArbitrary(1000, 5000));
  const walletClient = await getClient(chain, axiosInstance);
  const { request } = await walletClient.simulateContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "deposit",
    args: [zeroAddress, 0n, 0],
    value: toDeposit,
    account: privateKeyToAccount(wallet.pkᵻ),
  });
  await walletClient.writeContract(request);
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

  const isEligible = userBalanceInFuel === 0n && toDeposit > 0n && params.ethPrice * toDeposit >= params.minDeposit;

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

  // x4 possible costs
  return (depositCost + withdrawCost) * 4n;
};

export async function initDeposits(masterKey: string, minDeposit: number) {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;
  const decodedEVMAccounts = getDecodedEVM(profiles, masterKey);
  const publicClient = getPublicClient(chains.mainnet);

  const expenses = await getExpenses(publicClient);
  const ethPrice = await getPrice(publicClient, chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);

  const accountsToDeposit = await Promise.all(
    decodedEVMAccounts.map(prepare({ publicClient, expenses, ethPrice, minDeposit: parseEther(String(minDeposit)) })),
  );

  return accountsToDeposit.reduce((promise, { wallet, isEligible, toDeposit }) => {
    if (!isEligible) {
      return promise;
    }
    return promise.then(deposit(wallet, toDeposit));
  }, Promise.resolve());
}
