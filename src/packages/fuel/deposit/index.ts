import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { zeroAddress, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { abi } from "./abi";
import { getClient, getPublicClient } from "src/libs/clients";
import { decryptMarkedFields } from "src/libs/crypt";
import { refreshProxy } from "src/libs/proxify";
import { Profile } from "src/types/profile";

type EVMWallet = Profile["string"]["wallets"]["evm"];

const FUEL_DEPOSIT_CONTRACT = "0x19b5cc75846BF6286d599ec116536a333C4C2c14";

const getDecodedEVM = (profiles: Profile, masterKey: string) =>
  Object.values(decryptMarkedFields(profiles, masterKey) as Profile).map(({ wallets }) => ({
    ...wallets.evm,
  }));

const checkAndDeposit = (evmWallet: EVMWallet) => async () => {
  const pk = evmWallet.pkᵻ as `0x${string}`;
  const account = privateKeyToAccount(pk);

  const axiosInstance = await refreshProxy();
  const publicClient = getPublicClient(chains.mainnet);
  const walletClient = getClient(chains.mainnet, axiosInstance);

  const userBalance = await publicClient.readContract({
    address: FUEL_DEPOSIT_CONTRACT,
    abi,
    functionName: "getBalance",
    account,
    args: [account.address, zeroAddress],
  });

  console.log("userBalance in fuel sk", formatEther(userBalance));

  const balance = await publicClient.getBalance({
    address: account.address,
  });

  console.log("userBalance in wallet", formatEther(balance));

  if (userBalance === 0n && balance > 0n) {
    console.log("deposit");
    const gas = await publicClient.estimateContractGas({
      address: FUEL_DEPOSIT_CONTRACT,
      abi,
      functionName: "deposit",
      account,
      args: [zeroAddress, 0n, 0],
    });

    const { request } = await walletClient.simulateContract({
      address: FUEL_DEPOSIT_CONTRACT,
      abi,
      functionName: "deposit",
      args: [zeroAddress, 0n, 0],
      value: balance - gas,
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
