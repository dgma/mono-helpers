import { formatEther, parseEther } from "viem";
import * as chains from "viem/chains";
import { getPrice, chainLinkAddresses } from "src/libs/chainlink";
import { getPublicClient } from "src/libs/clients";
import { withdrawETH, consolidateETH, WithdrawChain, OKX_WITHDRAW_CHAINS } from "src/libs/okx";
import { getRandomArbitrary, saveInFolder, getProfiles } from "src/libs/shared";

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
  minBalance: number,
  maxBalance: number,
  withdrawChain: WithdrawChain,
) => {
  const profiles = getProfiles();

  const publicClient = getPublicClient(OKXChainToViem[withdrawChain]);

  const ethPrice = await getPrice(getPublicClient(chains.mainnet), chainLinkAddresses.ETHUSD[chains.mainnet.id], 18);

  const rawConfig = await Promise.all(
    Object.values(profiles).map(async (profile) => {
      const address = profile.wallets.evm.address as `0x${string}`;
      const balance = await publicClient.getBalance({
        address,
      });
      if (onlyZero && balance > 0n) {
        return {
          address,
          amount: "0",
          withdrawChain,
        };
      }
      const usdTargetBalance = String(getRandomArbitrary(minBalance, maxBalance));
      const expectedBalance = (10n ** 18n * parseEther(usdTargetBalance)) / ethPrice;
      return {
        address,
        amount: formatEther(expectedBalance - balance),
        withdrawChain,
      };
    }),
  );

  const config = rawConfig.filter((config) => parseFloat(config.amount) > 0);

  if (config.length > 0) {
    await consolidateETH();
    const data = await withdrawETH(config, 4 * 3600000, 8 * 3600000);
    saveInFolder(
      "./reports/withdrawals.report.json",
      JSON.stringify(
        {
          [new Date().toISOString()]: data,
        },
        null,
        2,
      ),
    );
  }
};
