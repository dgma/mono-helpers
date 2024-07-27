import { parseEther } from "viem";
import * as chains from "viem/chains";
import { MS_IN_MIN } from "src/constants/time";
import { getPublicClient } from "src/libs/clients";
import { loopUntil } from "src/libs/shared";

export const sleepForProperGasPrice = async (gweiGasPrice = 5, delay = 5 * MS_IN_MIN) =>
  await loopUntil(async () => {
    const gasPrice = await (await getPublicClient(chains.mainnet)).getGasPrice();
    return gasPrice < parseEther(`0.00000000${gweiGasPrice}`); // 8 gwei
  }, delay);
