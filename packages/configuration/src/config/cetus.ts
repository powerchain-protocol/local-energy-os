import { serverEnv } from "@/env/server";
export const CETUS_CONFIG = {
  network: (serverEnv.CETUS_NETWORK ?? "mainnet") as "mainnet" | "testnet",
  fullNodeUrl: serverEnv.CETUS_FULLNODE_URL,
} as const;
