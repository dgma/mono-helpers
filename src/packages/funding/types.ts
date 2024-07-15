import { PublicClient } from "viem";

export type FundingFilter = (client: PublicClient, address: `0x${string}`) => Promise<boolean>;
