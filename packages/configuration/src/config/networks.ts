import { clientEnv } from "@/env/client";

export type SolanaCluster = "devnet" | "mainnet-beta" | "custom";
export type SuiNetwork = "devnet" | "testnet" | "mainnet" | "custom";

export interface SolanaNetworkConfig {
  family: "solana";
  id: SolanaCluster;
  label: string;
  rpcUrl: string;
  explorerUrl: string;
  heliusSupported: boolean;
  programId?: string;
}

export interface SuiNetworkConfig {
  family: "sui";
  id: SuiNetwork;
  label: string;
  rpcUrl: string;
  explorerUrl: string;
}

const SOLANA_PUBLIC_RPC = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com"
} as const;

const SUI_PUBLIC_RPC = {
  devnet: "https://fullnode.devnet.sui.io:443",
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443"
} as const;

export const POWERCHAIN_PROGRAM_IDS = {
  devnet:
    clientEnv.NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_DEVNET ||
    "8QfX3BkJd3hY8wWbMh2n7eL2j24CrB4K1fYyYH2CwC8L",
  "mainnet-beta":
    clientEnv.NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_MAINNET ||
    "6JmRxJ8n4PjSrzQwNF7fHm1p4R9L3tY2eK5uG8vC2xNa"
} as const;

export const SOLANA_NETWORKS: Record<Exclude<SolanaCluster, "custom">, SolanaNetworkConfig> = {
  devnet: {
    family: "solana",
    id: "devnet",
    label: "Solana Devnet",
    rpcUrl: clientEnv.NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL || SOLANA_PUBLIC_RPC.devnet,
    explorerUrl: "https://explorer.solana.com/?cluster=devnet",
    heliusSupported: true,
    programId: POWERCHAIN_PROGRAM_IDS.devnet
  },
  "mainnet-beta": {
    family: "solana",
    id: "mainnet-beta",
    label: "Solana Mainnet Beta",
    rpcUrl: clientEnv.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || SOLANA_PUBLIC_RPC["mainnet-beta"],
    explorerUrl: "https://explorer.solana.com",
    heliusSupported: true,
    programId: POWERCHAIN_PROGRAM_IDS["mainnet-beta"]
  }
};

export const SUI_NETWORKS: Record<Exclude<SuiNetwork, "custom">, SuiNetworkConfig> = {
  devnet: {
    family: "sui",
    id: "devnet",
    label: "Sui Devnet",
    rpcUrl: clientEnv.NEXT_PUBLIC_SUI_DEVNET_RPC_URL || SUI_PUBLIC_RPC.devnet,
    explorerUrl: "https://suiscan.xyz/devnet"
  },
  testnet: {
    family: "sui",
    id: "testnet",
    label: "Sui Testnet",
    rpcUrl: clientEnv.NEXT_PUBLIC_SUI_TESTNET_RPC_URL || SUI_PUBLIC_RPC.testnet,
    explorerUrl: "https://suiscan.xyz/testnet"
  },
  mainnet: {
    family: "sui",
    id: "mainnet",
    label: "Sui Mainnet",
    rpcUrl: clientEnv.NEXT_PUBLIC_SUI_MAINNET_RPC_URL || SUI_PUBLIC_RPC.mainnet,
    explorerUrl: "https://suiscan.xyz/mainnet"
  }
};

/** Backward-compatible Solana network export. */
export const NETWORKS = SOLANA_NETWORKS;
export const DEFAULT_CLUSTER: SolanaCluster = clientEnv.NEXT_PUBLIC_SOLANA_CLUSTER;
export const DEFAULT_SUI_NETWORK: SuiNetwork = clientEnv.NEXT_PUBLIC_SUI_NETWORK;

function requireHttps(url: string | undefined, label: string): string {
  if (!url || !url.startsWith("https://")) {
    throw new Error(`${label} must be a secure HTTPS URL`);
  }
  return url;
}

export function resolveRpcUrl(cluster: SolanaCluster, customRpcUrl?: string): string {
  return cluster === "custom"
    ? requireHttps(customRpcUrl || clientEnv.NEXT_PUBLIC_SOLANA_CUSTOM_RPC_URL, "Custom Solana RPC URL")
    : SOLANA_NETWORKS[cluster].rpcUrl;
}

export function resolveSuiRpcUrl(network: SuiNetwork, customRpcUrl?: string): string {
  return network === "custom"
    ? requireHttps(customRpcUrl || clientEnv.NEXT_PUBLIC_SUI_CUSTOM_RPC_URL, "Custom Sui RPC URL")
    : SUI_NETWORKS[network].rpcUrl;
}
