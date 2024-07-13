import https from "https";
import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { refreshProxyAgent } from "./agent";
import proxyConfig from "./config";
import { headers, axiosInstance } from "./sham";
import { currentTime, markTime } from "src/libs/clock";
import { sleep } from "src/libs/shared";

type WhoamiReport = {
  hostname: string;
  ip: string[];
  headers: {
    Accept: string[];
    "Accept-Encoding": string[];
    "Accept-Language": string[];
    Priority: string[];
    "Sec-Ch-Ua": string[];
    "Sec-Ch-Ua-Mobile": string[];
    "Sec-Ch-Ua-Platform": string[];
    "Sec-Fetch-Dest": string[];
    "Sec-Fetch-Mode": string[];
    "Sec-Fetch-Site": string[];
    "Sec-Fetch-User": string[];
    "Upgrade-Insecure-Requests": string[];
    "User-Agent": string[];
    "X-Forwarded-For": string[];
    "X-Forwarded-Host": string[];
    "X-Real-Ip": string[];
  };
  url: string;
  host: string;
  method: "GET";
  remoteAddr: string;
};

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
