import type { AxiosInstance } from "axios";

export async function accountPoints(axiosInstance: AxiosInstance, address: string) {
  const scrollPoints = await axiosInstance.get<{ points: number; timestamp: string }[]>(
    `https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/scroll/wallet-points?walletAddress=${address}`,
  );

  return scrollPoints.data[0]?.points;
}
