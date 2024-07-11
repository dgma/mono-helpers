import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { zeroAddress, formatEther, parseEther, PublicClient } from "viem";
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

const prepare = (publicClient: PublicClient, expenses: bigint, ethPrice: bigint) => async (wallet: EVMWallet) => {
  const userBalanceInFuel = await publicClient.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [wallet.address, zeroAddress],
  });

  console.log("userBalance in fuel sk", formatEther(userBalanceInFuel));

  const balance = await publicClient.getBalance({
    address: wallet.address,
  });

  console.log("userBalance in wallet", formatEther(balance));

  console.log("user eth wallet balance in usd: ", formatEther(ethPrice * balance));

  const toDeposit = balance - expenses;

  const isEligible = userBalanceInFuel === 0n && ethPrice * toDeposit >= parseEther("100");

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

  return depositCost + withdrawCost;
};

export async function initDeposits(masterKey: string, medianDeposit: number) {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;
  const decodedEVMAccounts = getDecodedEVM(profiles, masterKey);
  const publicClient = getPublicClient(chains.mainnet);

  const expenses = await getExpenses(publicClient);
  const ethPrice = await getPrice(publicClient, chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);

  const accountsToDeposit = await Promise.all(decodedEVMAccounts.map(prepare(publicClient, expenses, ethPrice)));

  console.log(medianDeposit);
  return accountsToDeposit.reduce((promise, { wallet, isEligible, toDeposit }) => {
    if (!isEligible) {
      return promise;
    }
    return promise.then(deposit(wallet, toDeposit));
  }, Promise.resolve());
}
