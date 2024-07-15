import * as bitcoin from "bitcoinjs-lib";
import { bip32secp256k1 } from "../../libs/bit32";

export const genBtc = (seed: Buffer) => {
  const rootKey = bip32secp256k1.fromSeed(seed, bitcoin.networks.bitcoin).derivePath("m/84'/0'/0'/0/0");
  return {
    address: bitcoin.payments.p2wpkh({
      pubkey: rootKey.publicKey,
      network: bitcoin.networks.bitcoin,
    }).address,
    pkᵻ: rootKey.toWIF(),
  };
};
