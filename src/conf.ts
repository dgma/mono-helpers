import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SupportedChains } from "src/types/okx";
import { Networks } from "src/types/profile";

export type Conf = {
  proxy: {
    user: string;
    pass: string;
    host: string;
    port: string;
    "reboot-link": string;
  };
  rpc: {
    alchemy: {
      key: string;
    };
  };
  okx: {
    key: string;
    secret: string;
    password: string;
  };
  cli: {
    funding: {
      chain: SupportedChains;
      filters: ("noFuel" | "onlyZero" | "lteBalance")[];
      depositRange: [number, number];
      lteBalance: number;
    };
    fuel: {
      minDeposit: number;
    };
    report: {
      type: ("l1Balance" | "scroll" | "fuel")[];
      save: boolean;
    };
    profiles: {
      amount: number;
      chains: Networks[];
    };
  };
};

const config = JSON.parse(readFileSync(resolve(".", ".app.config.json"), "utf-8")) as Conf;

export default config;
