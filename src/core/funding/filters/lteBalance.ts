import { PublicClient } from "viem";

export const lteBalance = (minBalance: number) => async (client: PublicClient, address: `0x${string}`) => {
  const balance = await client.getBalance({
    address,
  });
  return balance > BigInt(minBalance);
};
