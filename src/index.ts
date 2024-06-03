import { httpPublicClient } from "./clients";
import { multicall } from "./contracts";

async function main() {
  const l1BlockNumber = await multicall.read.getBlockNumber();
  const networkBlockNumber = await httpPublicClient.getBlockNumber();

  console.log(`l1BlockNumber: ${l1BlockNumber}, networkBlockNumber: ${networkBlockNumber}`);
}

main();
