import https from "https";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { refreshProxyAgent } from "./agent";
import { headers, axiosInstance } from "./sham";
import readConf from "src/conf";
import { currentTime, markTime } from "src/libs/clock";
import { sleep } from "src/libs/shared";
import { WhoamiReport } from "src/types/proxify";

async function logIpInfo(axiosInstance: AxiosInstance) {
  const res = await axiosInstance.get<WhoamiReport>("https://whoami.lagunovsky.com/api");
  console.log(`ip ${res.data.headers["X-Real-Ip"]}`);
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function refreshProxy(minWait = 10000) {
  const timePassed = Date.now() - currentTime();
  const waitTime = minWait - timePassed;
  console.log(`wait ${waitTime}`);
  await sleep(waitTime);
  await logIpInfo(await axiosInstance());
  refreshProxyAgent();
  axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
  });
  const conf = await readConf();
  const res = await axios.get(conf.proxy["reboot-linkᵻ"], { timeout: 120000, headers, httpsAgent });
  console.log(`new ip ${res.data.new_ip}`);

  markTime();

  return axiosInstance();
}
