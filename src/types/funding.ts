import { PublicClient, Hex } from "viem";

export type FundingFilter = (client: PublicClient, address: Hex) => Promise<boolean>;
