import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { zeroAddress, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { FUEL_POINTS_CONTRACT_ABI, FUEL_POINTS_CONTRACT } from "./constants";
import { getPrice, chainLinkAddresses } from "src/libs/chainlink";
import { getClient, getPublicClient } from "src/libs/clients";
import { decryptMarkedFields } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { Profile } from "src/types/profile";

type EVMWallet = Profile["string"]["wallets"]["evm"];

const getDecodedEVM = (profiles: Profile, masterKey: string) =>
  Object.values(decryptMarkedFields(profiles, masterKey) as Profile).map(({ wallets }) => ({
    ...wallets.evm,
  }));

const checkAndDeposit = (evmWallet: EVMWallet) => async () => {
  const chain = chains.mainnet;
  const pk = evmWallet.pkᵻ as `0x${string}`;
  const account = privateKeyToAccount(pk);

  const axiosInstance = await refreshProxy();
  const publicClient = getPublicClient(chain);
  const walletClient = getClient(chain, axiosInstance);

  const userBalanceInFuel = await publicClient.readContract({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "getBalance",
    args: [account.address, zeroAddress],
  });

  console.log("userBalance in fuel sk", formatEther(userBalanceInFuel));

  const balance = await publicClient.getBalance({
    address: account.address,
  });

  const gas = await publicClient.estimateContractGas({
    address: FUEL_POINTS_CONTRACT,
    abi: FUEL_POINTS_CONTRACT_ABI,
    functionName: "deposit",
    args: [zeroAddress, 0n, 0],
    value: 10n,
  });

  console.log("userBalance in wallet", formatEther(balance));

  const ethPrice = await getPrice(publicClient, chainLinkAddresses.ETHUSD[chain.id], 18);

  console.log("user eth wallet balance in usd: ", formatEther(ethPrice * balance));

  const valueToDeposit = balance - gas;

  if (userBalanceInFuel === 0n && ethPrice * valueToDeposit >= parseEther("100")) {
    /** Todo add timer randomization */
    const { request } = await walletClient.simulateContract({
      address: FUEL_POINTS_CONTRACT,
      abi: FUEL_POINTS_CONTRACT_ABI,
      functionName: "deposit",
      args: [zeroAddress, 0n, 0],
      value: valueToDeposit,
      account,
    });
    await walletClient.writeContract(request);
  }
};

export function deposit(masterKey: string) {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;

  return [getDecodedEVM(profiles, masterKey)[0]].reduce((promise, accountData) => {
    return promise.then(checkAndDeposit(accountData));
  }, Promise.resolve());
}
