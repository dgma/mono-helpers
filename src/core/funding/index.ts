import { formatEther, parseEther } from "viem";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";
import { getPrice } from "src/libs/chainlink";
import { getPublicClient } from "src/libs/clients";
import { withdrawETH, consolidateETH } from "src/libs/okx";
import { getRandomArbitrary, saveInFolder, getProfiles } from "src/libs/shared";
import { FundingFilter } from "src/types/funding";
import { WithdrawChain } from "src/types/okx";

const OKXChainToViem = {
  [OKX_WITHDRAW_CHAINS.eth]: chains.mainnet,
  [OKX_WITHDRAW_CHAINS.arb]: chains.arbitrum,
  [OKX_WITHDRAW_CHAINS.op]: chains.optimism,
  [OKX_WITHDRAW_CHAINS.zks]: chains.zkSync,
  [OKX_WITHDRAW_CHAINS.linea]: chains.linea,
  [OKX_WITHDRAW_CHAINS.matic]: chains.polygon,
  [OKX_WITHDRAW_CHAINS.base]: chains.base,
};

export const initFunding = async (
  filters: FundingFilter[],
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
      for (let filter of filters) {
        const filterPassed = await filter(publicClient, address);
        if (!filterPassed) {
          return {
            address,
            amount: "0",
            withdrawChain,
          };
        }
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
    console.log("start funding process..");
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
