import { Hex } from "viem";
import { Chain } from "viem/chains";
import { getEVMWallets } from "src/libs/configs";
import { getBalance, transfer } from "src/libs/erc20";
import { refreshProxy } from "src/libs/proxify";
import { sleep, getRandomArbitrary } from "src/libs/shared";
import { logger } from "src/logger";

export const distributeERC = async (chain: Chain, tokenAddress: Hex) => {
  const wallets = await getEVMWallets();
  const [, value] = await getBalance({
    walletAddress: wallets[0].address,
    tokenAddress,
    chain,
  });

  logger.debug(`token balance of ${wallets[0].address} is ${value}`, { label: "core/distributeERC" });

  let valueLeft = value;

  const config = wallets.slice(1).map(({ address }, index) => {
    const amount = (valueLeft / 100n) * BigInt(index + 1);
    valueLeft -= amount;
    return {
      to: address,
      amount,
    };
  });

  if (value - valueLeft !== config.reduce((acc, { amount }) => acc + amount, 0n)) {
    logger.error(`config creation error`, {
      label: "core/distributeERC",
    });
  }

  for (const item of config) {
    transfer({
      wallet: wallets[0],
      tokenAddress: tokenAddress,
      receiverAddress: item.to,
      amount: item.amount,
      axiosInstance: await refreshProxy(0),
      chain,
    });
    await sleep(getRandomArbitrary(3.6e6, 2 * 3.6e6));
  }
};
