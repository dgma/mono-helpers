import axios, { CreateAxiosDefaults } from "axios";
import { getProxyAgent } from "./agent";

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
export const CH_USER_AGENT = '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"';

export const headers = {
  "user-agent": USER_AGENT,
  "accept-language": "en",
  dnt: "1",
  priority: "u=1, i",
  "sec-ch-ua": CH_USER_AGENT,
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
};

export function axiosInstance(
  override: CreateAxiosDefaults = {
    httpsAgent: getProxyAgent(),
  },
) {
  return axios.create({
    ...override,
    headers: {
      ...headers,
      ...override.headers,
    },
  });
}
