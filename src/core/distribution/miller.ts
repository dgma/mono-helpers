import { Hex } from "viem";
import { Chain } from "viem/chains";
import { getEVMWallets } from "src/libs/configs";
import { getBalance } from "src/libs/erc20";
import { distributeERC20 } from "src/libs/miller";
import { refreshProxy } from "src/libs/proxify";
import { logger } from "src/logger";

export const mill = async (chain: Chain, tokenAddress: Hex, millerAddress: Hex) => {
  const wallets = await getEVMWallets();
  const [, value] = await getBalance({
    walletAddress: wallets[0].address,
    tokenAddress,
    chain,
  });

  logger.debug(`token balance ${value}`, { label: "core/miller" });

  let valueLeft = value;

  const config = wallets.slice(1).map(({ address }, index) => {
    if (index != wallets.length - 2) {
      const amount = (valueLeft / 100n) * BigInt(index + 1);
      valueLeft -= amount;
      return {
        to: address,
        amount,
      };
    }
    return {
      to: address,
      amount: valueLeft,
    };
  });

  if (value !== config.reduce((acc, { amount }) => acc + amount, 0n)) {
    logger.error(`config creation error`, {
      label: "core/miller",
    });
  }

  logger.debug(`config ${JSON.stringify(config, (_, v) => (typeof v === "bigint" ? v.toString() : v))}`, {
    label: "core/miller",
  });

  return distributeERC20({
    chain,
    axiosInstance: await refreshProxy(0),
    tokenAddress,
    millerAddress,
    wallet: wallets[0],
    config: config,
    permitValue: value,
  });
};
