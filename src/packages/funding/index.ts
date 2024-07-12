import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatEther } from "viem";
import * as chains from "viem/chains";
import { getPrice, chainLinkAddresses } from "src/libs/chainlink";
import { getPublicClient } from "src/libs/clients";
import { withdrawETH, consolidateETH, WithdrawChain, OKX_WITHDRAW_CHAINS } from "src/libs/okx";
import { getRandomArbitrary } from "src/libs/shared";
import { Profile } from "src/types/profile";

const OKXChainToViem = {
  [OKX_WITHDRAW_CHAINS.ETH]: chains.mainnet,
  [OKX_WITHDRAW_CHAINS.ARB]: chains.arbitrum,
  [OKX_WITHDRAW_CHAINS.OP]: chains.optimism,
  [OKX_WITHDRAW_CHAINS.ZKS]: chains.zkSync,
  [OKX_WITHDRAW_CHAINS.LINEA]: chains.linea,
  [OKX_WITHDRAW_CHAINS.MATIC]: chains.polygon,
  [OKX_WITHDRAW_CHAINS.BASE]: chains.base,
};

export const initFunding = async (
  onlyZero: boolean,
  minAmount: number,
  maxAmount: number,
  withdrawChain: WithdrawChain,
) => {
  const profiles = JSON.parse(readFileSync(resolve(".", ".profiles.json"), "utf-8")) as Profile;

  const publicClient = getPublicClient(OKXChainToViem[withdrawChain]);

  const profilesToDeposit = onlyZero
    ? await Object.values(profiles).reduce(
        async (promise, profile) => {
          const profilesToDepositAcc = await promise;
          const address = profile.wallets.evm.address as `0x${string}`;
          const balance = await publicClient.getBalance({
            address,
          });
          if (balance === 0n) {
            profilesToDepositAcc.push(profile);
          }
          return profilesToDepositAcc;
        },
        Promise.resolve([] as Profile[string][]),
      )
    : Object.values(profiles);

  if (profilesToDeposit.length > 0) {
    const ethPrice = await getPrice(getPublicClient(chains.mainnet), chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);
    const config = profilesToDeposit.map((profile) => ({
      address: profile.wallets.evm.address as `0x${string}`,
      amount: String(parseFloat(formatEther(ethPrice)) / getRandomArbitrary(minAmount, maxAmount)),
      withdrawChain,
    }));
    await consolidateETH();
    return withdrawETH(config, 7 * 3600000, 10 * 3600000);
  }
};
