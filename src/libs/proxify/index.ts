import https from "https";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { refreshProxyAgent } from "./agent";
import { headers, axiosInstance } from "./sham";
import readConf from "src/conf";
import Clock from "src/libs/clock";
import { WhoamiReport } from "src/types/proxify";

async function logIpInfo(axiosInstance: AxiosInstance) {
  const res = await axiosInstance.get<WhoamiReport>("https://whoami.lagunovsky.com/api");
  console.log(`ip ${res.data.headers["X-Real-Ip"]}`);
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const localClock = new Clock();

export async function refreshProxy(minWait = 10000) {
  await localClock.sleepMax(minWait);
  await logIpInfo(await axiosInstance());
  await refreshProxyAgent();
  axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
  });
  const conf = await readConf();
  const res = await axios.get(conf.proxy["reboot-linkᵻ"], { timeout: 120000, headers, httpsAgent });
  console.log(`new ip ${res.data.new_ip}`);

  localClock.markTime();

  return axiosInstance();
}
