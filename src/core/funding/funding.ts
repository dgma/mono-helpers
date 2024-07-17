import { formatEther, parseEther } from "viem";
import * as chains from "viem/chains";
import { chainLinkAddresses } from "src/constants/chainlink";
import { OKX_WITHDRAW_CHAINS } from "src/constants/okx";
import { getPrice } from "src/libs/chainlink";
import { getPublicClient } from "src/libs/clients";
import Clock from "src/libs/clock";
import { getProfiles } from "src/libs/configs";
import { withdrawETH, consolidateETH, EVMNetworksConfig } from "src/libs/okx";
import { getRandomArbitrary, loopUntil } from "src/libs/shared";
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

const localClock = new Clock();

const amountGeZero = ({ amount }: { amount: string }) => amount !== "0";

const getEligibleFunding = async ({ filters, range, chain, maxFee }: Params) => {
  const profiles = await getProfiles();

  const publicClient = await getPublicClient(OKXChainToViem[chain]);

  const ethPrice = await getPrice(
    await getPublicClient(chains.mainnet),
    chainLinkAddresses.ETHUSD[chains.mainnet.id],
    18,
  );
  await loopUntil(
    async () => {
      const evmChainConfig = await EVMNetworksConfig(chain);
      const ethPrice = await getPrice(
        await getPublicClient(chains.mainnet),
        chainLinkAddresses.ETHUSD[chains.mainnet.id],
        0,
      );
      const maxFeeConverted = parseFloat(formatEther(parseEther(String(maxFee)) / ethPrice));
      if (maxFeeConverted <= evmChainConfig.fee) {
        console.log(`Withdrawal fee is above allowed maximum ${maxFee}`);
        return false;
      }
      if (evmChainConfig.limits.withdraw.min >= range[1]) {
        console.log(`Amount to withdraw ${range[1]} is below ${evmChainConfig.limits.withdraw.min}`);
        return false;
      }
      if (!evmChainConfig.withdraw) {
        console.log(`Withdraw ETH for network ${chain} is disabled`);
        return false;
      }
      return true;
    },
    5 * 60 * 1000,
  );
  const evmChainConfig = await EVMNetworksConfig(chain);
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
            chain: evmChainConfig.id,
            fee: "0",
          };
        }
      }
      const usdTargetBalance = String(getRandomArbitrary(range[0], range[1]));
      const expectedBalance = (10n ** 18n * parseEther(usdTargetBalance)) / ethPrice;
      return {
        address,
        amount: formatEther(expectedBalance - balance),
        chain: evmChainConfig.id,
        fee: String(evmChainConfig.fee),
      };
    }),
  );

  console.log("accounts to fund", rawConfig.filter(amountGeZero).length);

  return rawConfig.find(amountGeZero);
};

export const initFunding = async (params: Params) => {
  const report = [];

  let config = await getEligibleFunding(params);

  while (config) {
    await consolidateETH();
    const receipt = await withdrawETH(config);
    report.push(receipt);
    await localClock.markTime();
    config = await getEligibleFunding(params);
    await localClock.sleepMax(getRandomArbitrary(4 * 3600000, 8 * 3600000));
  }
};
