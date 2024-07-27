import { Hex } from "viem";
import { Chain } from "viem/chains";
import { MS_IN_HOUR } from "src/constants/time";
import { getEVMWallets } from "src/libs/configs";
import { getBalance, transfer } from "src/libs/erc20";
import { sleepForProperGasPrice } from "src/libs/evm";
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
    logger.info(`begin operation for ${item.to}`, {
      label: "core/distributeERC",
    });
    const [, balance] = await getBalance({
      walletAddress: item.to,
      tokenAddress,
      chain,
    });
    if (balance > 0n) {
      logger.info(`has already processed, skip`, {
        label: "core/distributeERC",
      });
      continue;
    }
    await sleepForProperGasPrice();
    await transfer({
      wallet: wallets[0],
      tokenAddress: tokenAddress,
      receiverAddress: item.to,
      amount: item.amount,
      chain,
    });
    const time = getRandomArbitrary(2 * MS_IN_HOUR, 3 * MS_IN_HOUR);
    logger.info(`sleep for ${time}`, {
      label: "core/distributeERC",
    });
    await sleep(time);
  }
};
