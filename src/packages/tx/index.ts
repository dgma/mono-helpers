import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import * as chains from "viem/chains";
import { getClient } from "src/libs/local-evm-client";

type SupportedNetworks = keyof typeof chains;

export async function tx(network: string) {
  const client = getClient(chains[network as SupportedNetworks] || chains.mainnet);
  const account = privateKeyToAccount("0xc7d9d44df8fa6567e30963cecc0d91b3b798c08ebdee6c30b66ad63dff0eece7");

  const hash = await client.sendTransaction({
    account,
    to: "0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC",
    value: parseEther("0.001"),
  });

  return hash;
}
