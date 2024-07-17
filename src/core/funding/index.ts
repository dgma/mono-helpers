import { formatEther, parseEther } from "viem";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";
import { getPrice } from "src/libs/chainlink";
import { getPublicClient } from "src/libs/clients";
import { withdrawETH, consolidateETH } from "src/libs/okx";
import { getRandomArbitrary, saveInFolder, getProfiles, sleep } from "src/libs/shared";
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

type Params = {
  filters: FundingFilter[];
  range: [number, number];
  chain: WithdrawChain;
  maxFee: number;
};

const getEligibleFunding = async ({ filters, range, chain, maxFee }: Params) => {
  const profiles = getProfiles();

  const publicClient = getPublicClient(OKXChainToViem[chain]);

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
            withdrawChain: chain,
            maxFee: "0",
          };
        }
      }
      const usdTargetBalance = String(getRandomArbitrary(range[0], range[1]));
      const expectedBalance = (10n ** 18n * parseEther(usdTargetBalance)) / ethPrice;
      const maxFeeConverted = formatEther((10n ** 18n * parseEther(String(maxFee))) / ethPrice);
      return {
        address,
        amount: formatEther(expectedBalance - balance),
        withdrawChain: chain,
        maxFee: maxFeeConverted,
      };
    }),
  );

  console.log("accounts to fund", rawConfig.length);

  return rawConfig.find(({ amount }) => amount !== "0");
};

export const initFunding = async (params: Params) => {
  const report = [];
  let config = await getEligibleFunding(params);

  while (config) {
    await consolidateETH();
    const receipt = await withdrawETH(config);
    report.push(receipt);
    const pauseMs = getRandomArbitrary(4 * 3600000, 8 * 3600000);
    console.log("sleep for", pauseMs);
    await sleep(pauseMs);
  }

  // Todo: save each deposit
  saveInFolder(
    "./reports/withdrawals.report.json",
    JSON.stringify(
      {
        [new Date().toISOString()]: report,
      },
      null,
      2,
    ),
  );
};
