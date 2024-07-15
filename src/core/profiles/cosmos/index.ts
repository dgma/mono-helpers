import { ripemd160, sha256 } from "@cosmjs/crypto";
import { toBech32 } from "@cosmjs/encoding";
import { bip32secp256k1 } from "../../../libs/bit32";
import { chains, Chain } from "./chains";

function rawSecp256k1PubkeyToRawAddress(pubkeyData: Buffer) {
  if (pubkeyData.length !== 33) {
    throw new Error(`Invalid Secp256k1 pubkey length (compressed): ${pubkeyData.length}`);
  }
  return ripemd160(sha256(pubkeyData));
}

const gen = (chain: Chain) => (seed: Buffer) => {
  const hdPath = `m/44'/${chain.bip44.coinType}'/0'/0/0`;
  const keyPair = bip32secp256k1.fromSeed(seed).derivePath(hdPath);
  return {
    address: toBech32(chain.addressPrefix, rawSecp256k1PubkeyToRawAddress(keyPair.publicKey)),
    pkᵻ: Buffer.from(keyPair.privateKey as Buffer).toString("hex"),
  };
};

export const genAtom = gen(chains.cosmos);
export const genTia = gen(chains.celestia);
