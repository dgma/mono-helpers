import https from "https";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { refreshProxyAgent } from "./agent";
import proxyConfig from "./config";
import { headers, axiosInstance } from "./sham";
import { currentTime, markTime } from "src/libs/clock";
import { sleep } from "src/libs/shared";

async function logIpInfo(proxifyAxios: AxiosInstance) {
  const res = await proxifyAxios.get("https://ident.me");
  console.log(`ip ${res.data}`);
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function refreshProxy(minWait = 10000) {
  const timePassed = Date.now() - currentTime();
  const waitTime = minWait - timePassed;
  console.log(`wait ${waitTime}`);
  await sleep(waitTime);
  await logIpInfo(axiosInstance());
  refreshProxyAgent();
  axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
      return retryCount * 1000;
    },
  });
  const res = await axios.get(proxyConfig().rebootURL, { timeout: 120000, headers, httpsAgent });
  console.log(`new ip ${res.data.new_ip}`);

  markTime();

  return axiosInstance();
}
