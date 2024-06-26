// eslint-disable-next-line import/no-unresolved
import { HDKey } from "micro-key-producer/cjs/slip10";
import { getAddress } from "micro-sol-signer";

export const genSol = (seed: Buffer) => {
  const hdPath = `m/44'/501'/0'/0'`;
  const keyPair = HDKey.fromMasterSeed(seed.toString("hex")).derive(hdPath);

  return {
    address: getAddress(keyPair.privateKey),
    pkᵻ: Buffer.from(keyPair.privateKey).toString("hex"),
  };
};
