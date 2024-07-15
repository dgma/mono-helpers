export type WhoamiReport = {
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
