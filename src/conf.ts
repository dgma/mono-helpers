import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { decryptMarkedFields, decrypt } from "src/libs/crypt";
import { getMasterKey } from "src/libs/shared";
import { SupportedChains } from "src/types/okx";
import { Networks } from "src/types/profile";

export type Conf = {
  masterKey: string;
  proxy: {
    userᵻ: string;
    passᵻ: string;
    hostᵻ: string;
    portᵻ: string;
    "reboot-linkᵻ": string;
  };
  rpc: {
    alchemy: {
      keyᵻ: string;
    };
  };
  okx: {
    keyᵻ: string;
    secretᵻ: string;
    passwordᵻ: string;
  };
  cli: {
    funding: {
      chain: SupportedChains;
      filters: ("noFuel" | "onlyZero" | "lteBalance")[];
      depositRange: [number, number];
      lteBalance?: number;
      maxFee: number;
    };
    fuel: {
      minDeposit: number;
    };
    report: {
      type: ("l1Balance" | "scroll" | "fuel")[];
      save?: boolean;
    };
    profiles: {
      amount: number;
      chains: Networks[];
    };
  };
};

let config: Conf;

const readConf = async () => {
  if (!config) {
    const encodedConfig = JSON.parse(readFileSync(resolve(".", ".app.config.json"), "utf-8")) as Conf;
    console.log(encodedConfig.okx.keyᵻ);
    const masterKey = await getMasterKey();
    console.log(masterKey[0], masterKey[masterKey.length - 1]);
    console.log(masterKey.length);
    console.log(decrypt(encodedConfig.okx.keyᵻ, masterKey));
    config = decryptMarkedFields(encodedConfig, masterKey) as Conf;
    config.masterKey = masterKey;
  }
  return config;
};

export default readConf;
