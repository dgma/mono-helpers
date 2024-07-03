import { refreshProxy } from "src/libs/proxify";

export async function report() {
  const axiosInstance = await refreshProxy();
  const res = await axiosInstance.get(
    "https://kx58j6x5me.execute-api.us-east-1.amazonaws.com/scroll/wallet-points?walletAddress=",
  );
  console.log(res.data);
}
