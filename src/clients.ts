import { createClient, createPublicClient, webSocket, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import chains from "./chains";
import { node_pk, rpc, ws_rpc, network } from "./env";

export const wsPublicClient = createPublicClient({
  chain: chains[network],
  transport: webSocket(ws_rpc),
});

export const httpPublicClient = createPublicClient({
  chain: chains[network],
  transport: http(rpc),
});

export const httpClient = createClient({
  account: privateKeyToAccount(node_pk as `0x${string}`),
  chain: chains[network],
  transport: http(rpc),
});
