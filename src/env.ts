import * as dotenv from "dotenv";
import type { SupportedChains } from "./chains";
const config = dotenv.config({ path: "./.env.local" });

const getEnv = (prop: string) => config?.parsed?.[prop] || process.env[prop];

export const node_pk = getEnv("NODE_PK");
export const rpc = getEnv("RPC");
export const ws_rpc = getEnv("WS_RPC");
export const network = (getEnv("NETWORK") || "localhost") as SupportedChains;

if (!node_pk || !rpc || !ws_rpc || !network) {
  throw new Error("Configuration mistake. Check your env file");
}

export default getEnv;
