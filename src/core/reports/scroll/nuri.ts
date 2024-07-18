import type { AxiosInstance } from "axios";

type NuriLPStat = {
  amount0: number;
  amount1: number;
  boost: number;
  boosted_liq: number;
  decimals0: number;
  decimals1: number;
  fee: number;
  gauge_address: string;
  liquidity: number;
  nft_id: number;
  pool_address: string;
  pool_boostedliq: number;
  pool_liquidity: number;
  symbol0: string;
  symbol1: string;
  tick: number;
  tick_lower: number;
  tick_upper: number;
  token0: string;
  token1: string;
  tokens_per_day: {
    [addr: string]: number;
  };
};

export async function getLpStats(axiosInstance: AxiosInstance, address: string) {
  const res = await axiosInstance.get<number[]>(`https://nuri-api-production.up.railway.app/nfp_ids?wallet=${address}`);

  if (res.data.length) {
    const stats = await axiosInstance.get<NuriLPStat[]>(
      `https://nuri-api-production.up.railway.app/apr_backtest?nft_ids=${res.data.join(",")}`,
    );

    return stats.data.map((lpStat) => ({
      [lpStat.symbol0]: lpStat.amount0,
      [lpStat.symbol1]: lpStat.amount1,
    }));
  }

  return null;
}
