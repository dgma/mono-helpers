import { PublicClient } from "viem";

export const onlyZero = async (client: PublicClient, address: `0x${string}`) => {
  const balance = await client.getBalance({
    address,
  });
  return balance === 0n;
};
