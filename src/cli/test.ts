import { scroll } from "viem/chains";
import { getClient } from "src/libs/clients";
import { getEVMWallets } from "src/libs/configs";
import { refreshProxy } from "src/libs/proxify";
import { sleep } from "src/libs/shared";
import { logger } from "src/logger";

(async function mainnet() {
  const axiosInstance = await refreshProxy(0);
  const wallets = await getEVMWallets();
  const client = await getClient(scroll, axiosInstance);
  await wallets.reduce(async (promise, wallet) => {
    await promise;
    await sleep(1500);
    const txCount = await client.getTransactionCount({
      address: wallet.address,
      // address: "0x104BD18D9Bbf14516DD90345ef4a2B050D9A7C43",
    });
    logger.info(`tx count ${txCount}`, { label: "CLI::test" });
    return;
  }, Promise.resolve());
})();
