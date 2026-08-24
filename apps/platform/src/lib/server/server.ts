import "server-only";

import { serverEnv } from "@/env/server";

export type ServerRuntime = {
  environment: "development" | "test" | "production";
  solanaCluster: "devnet" | "mainnet-beta" | "custom";
  suiNetwork: "devnet" | "testnet" | "mainnet" | "custom";
};

export function getServerRuntime(): ServerRuntime {
  return {
    environment: serverEnv.NODE_ENV,
    solanaCluster: serverEnv.NEXT_PUBLIC_SOLANA_CLUSTER,
    suiNetwork: serverEnv.NEXT_PUBLIC_SUI_NETWORK,
  };
}
