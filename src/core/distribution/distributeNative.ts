import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem/chains";
import { MS_IN_HOUR } from "src/constants/time";
import { getClient } from "src/libs/clients";
import { getEVMWallets } from "src/libs/configs";
import { sleepForProperGasPrice } from "src/libs/evm";
import { sleep, getRandomArbitrary } from "src/libs/shared";
import { logger } from "src/logger";

export const distributeNative = async (chain: Chain) => {
  const wallets = await getEVMWallets();

  const client = await getClient(chain);

  const value = await client.getBalance({
    address: wallets[0].address,
  });

  logger.debug(`balance of ${wallets[0].address} is ${value}`, { label: "core/distributeNative" });

  let valueLeft = value;

  const config = wallets.slice(1).map(({ address }, index) => {
    const amount = (valueLeft / 100n) * BigInt(index + 1);
    const minSpend = parseEther(`0.00${getRandomArbitrary(13, 175)}`);
    const amountToSpend = amount > minSpend ? amount : minSpend;
    valueLeft -= amountToSpend;
    return {
      to: address,
      amount: amountToSpend,
    };
  });

  if (value - valueLeft !== config.reduce((acc, { amount }) => acc + amount, 0n)) {
    logger.error(`config creation error`, {
      label: "core/distributeNative",
    });
  }

  for (const item of config) {
    logger.info(`begin operation for ${item.to}`, {
      label: "core/distributeNative",
    });
    const balance = await client.getBalance({
      address: item.to,
    });
    if (balance > 0n) {
      logger.info(`has already processed, skip`, {
        label: "core/distributeNative",
      });
      continue;
    }
    await sleepForProperGasPrice();
    const tx = await client.sendTransaction({
      account: privateKeyToAccount(wallets[0].pkᵻ),
      to: item.to,
      value: item.amount,
      chain,
    });
    logger.info(`tx send ${tx}`, {
      label: "core/distributeNative",
    });
    const time = getRandomArbitrary(2 * MS_IN_HOUR, 3 * MS_IN_HOUR);
    logger.info(`sleep for ${time}`, {
      label: "core/distributeNative",
    });
    await sleep(time);
  }
};
