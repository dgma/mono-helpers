import { Hex } from "viem";
import { Chain } from "viem/chains";
import { getEVMWallets } from "src/libs/configs";
import { getBalance } from "src/libs/erc20";
import { distributeERC20 } from "src/libs/miller";
import { refreshProxy } from "src/libs/proxify";

export const distribution = async (chain: Chain, tokenAddress: Hex, millerAddress: Hex) => {
  const wallets = await getEVMWallets();
  const axiosInstance = await refreshProxy(0);
  const [, value] = await getBalance({
    walletAddress: wallets[0].address,
    tokenAddress,
    chain,
  });

  let valueLeft = value;

  const config = wallets.slice(1).map(({ address }, index) => {
    if (index != wallets.length - 2) {
      const amount = (value / 100n) * BigInt(index + 1);
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

  return distributeERC20({
    chain,
    axiosInstance,
    tokenAddress,
    millerAddress,
    wallet: wallets[0],
    config: config,
    permitValue: value,
  });
};
