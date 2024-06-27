import { HDNodeWallet } from "ethers";

const defaultPath = "m/44'/60'/0'/0/0";

export const genEVM = (seed: Buffer) => {
  const hd = HDNodeWallet.fromSeed(`0x${Buffer.from(seed).toString("hex")}`).derivePath(defaultPath);
  return {
    address: hd.address,
    pkᵻ: hd.privateKey,
  };
};
