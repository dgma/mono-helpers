import https from "https";
import axios, { AxiosInstance } from "axios";
import { refreshProxyAgent } from "./agent";
import proxyConfig from "./config";
import { headers, axiosInstance } from "./sham";
import { sleep } from "src/libs/shared";

async function logIpInfo(proxifyAxios: AxiosInstance) {
  const res = await proxifyAxios.get("https://ident.me");
  console.log(`ip ${res.data}`);
}

let time = Date.now();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function refreshProxy() {
  const timePassed = Date.now() - time;
  await sleep(1000 - timePassed);
  await logIpInfo(axiosInstance());
  refreshProxyAgent();
  const res = await axios.get(proxyConfig().rebootURL, { timeout: 120000, headers, httpsAgent });
  console.log(`res ${res.data}`);
}
