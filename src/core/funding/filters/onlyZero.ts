import { PublicClient, Hex } from "viem";

export const onlyZero = async (client: PublicClient, address: Hex) => {
  const balance = await client.getBalance({
    address,
  });
  return balance === 0n;
};
