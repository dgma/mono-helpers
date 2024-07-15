import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  packages: {
    funding: {
      chain: "eth" | "arb" | "op" | "zks" | "linea" | "matic" | "base";
      filters: ("noFuel" | "onlyZero")[];
      depositRange: [number, number];
    };
  };
};

const config = JSON.parse(readFileSync(resolve(".", ".app.config.json"), "utf-8")) as Conf;

export default config;
