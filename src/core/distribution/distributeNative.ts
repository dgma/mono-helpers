import { parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { Chain } from "viem/chains";
import { getClient } from "src/libs/clients";
import { getEVMWallets } from "src/libs/configs";
// import { refreshProxy } from "src/libs/proxify";
import { sleep, getRandomArbitrary } from "src/libs/shared";
import { logger } from "src/logger";

const MIN_SPEND = parseEther("0.0015");

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
    const amountToSpend = amount > MIN_SPEND ? amount : MIN_SPEND;
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
    const tx = await client.sendTransaction({
      account: privateKeyToAccount(wallets[0].pkᵻ),
      to: item.to,
      value: item.amount,
      chain,
    });
    logger.info(`tx send ${tx}`, {
      label: "core/distributeNative",
    });
    const time = getRandomArbitrary(2 * 3.6e6, 3 * 3.6e6);
    logger.info(`sleep for ${time}`, {
      label: "core/distributeNative",
    });
    await sleep(time);
  }
};
