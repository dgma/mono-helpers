import { readFileSync } from "node:fs";
import { resolve } from "node:path";
// import axiosRetry from "axios-retry";
import { getContract, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { abi } from "./abi";
import { decryptMarkedFields } from "src/libs/crypt";
import { getClient } from "src/libs/local-evm-client";
import { Profile } from "src/types/profile";

// export async function tx(network: string) {
//   const client = getClient(chains[network as SupportedNetworks] || chains.mainnet);
//   const account = privateKeyToAccount("0xc7d9d44df8fa6567e30963cecc0d91b3b798c08ebdee6c30b66ad63dff0eece7");

//   const hash = await client.sendTransaction({
//     account,
//     to: "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
//     value: parseEther("0.001"),
//   });

//   return hash;
// }

function getDecodedEVM(profiles: Profile, masterKey: string) {
  return Object.values(decryptMarkedFields(profiles, masterKey) as Profile).map(({ wallets }) => ({
    ...wallets.evm,
  }));
}

type EVMWallet = Profile["string"]["wallets"]["evm"];

const checkAndDeposit = (client: ReturnType<typeof getClient>, evmWallet: EVMWallet) => async () => {
  const pk = evmWallet.pkᵻ as `0x${string}`;
  const account = privateKeyToAccount(pk);

  const contract = getContract({
    address: "0x19b5cc75846BF6286d599ec116536a333C4C2c14",
    abi,
    client,
  });

  const userBalance = await contract.read.getBalance([account.address, zeroAddress]);

  console.log("userBalance", userBalance);

  /**
   * 0. check wether deposit has been made
   * 1. read account balance
   * 2. identify tier
   * 3. deposit
   */
};

export function deposit(masterKey: string) {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;
  const client = getClient(chains.mainnet);

  return [getDecodedEVM(profiles, masterKey)[0]].reduce((promise, accountData) => {
    return promise.then(checkAndDeposit(client, accountData));
  }, Promise.resolve());
}
