import "server-only";
import { serverEnv } from "@/env/server";
import {
  SOLANA_NETWORKS,
  SUI_NETWORKS,
  type SolanaCluster,
  type SuiNetwork
} from "./networks";

function secureUrl(value: string | undefined, fallback: string, label: string): string {
  const url = value || fallback;
  if (!url.startsWith("https://")) throw new Error(`${label} must use HTTPS`);
  return url;
}

export function resolveServerSolanaRpc(cluster: SolanaCluster, customRpcUrl?: string): string {
  if (cluster === "custom") {
    return secureUrl(customRpcUrl || serverEnv.SOLANA_CUSTOM_RPC_URL, "", "Custom Solana RPC URL");
  }

  const privateUrl =
    cluster === "devnet" ? serverEnv.SOLANA_DEVNET_RPC_URL : serverEnv.SOLANA_MAINNET_RPC_URL;
  const heliusUrl =
    cluster === "devnet" ? serverEnv.HELIUS_DEVNET_RPC_URL : serverEnv.HELIUS_MAINNET_RPC_URL;

  if (heliusUrl) return secureUrl(heliusUrl, SOLANA_NETWORKS[cluster].rpcUrl, "Helius RPC URL");
  if (serverEnv.HELIUS_API_KEY) {
    const network = cluster === "devnet" ? "devnet" : "mainnet";
    return `https://${network}.helius-rpc.com/?api-key=${encodeURIComponent(serverEnv.HELIUS_API_KEY)}`;
  }
  return secureUrl(privateUrl, SOLANA_NETWORKS[cluster].rpcUrl, "Solana RPC URL");
}

export function resolveServerSuiRpc(network: SuiNetwork, customRpcUrl?: string): string {
  if (network === "custom") {
    return secureUrl(customRpcUrl || serverEnv.SUI_CUSTOM_RPC_URL, "", "Custom Sui RPC URL");
  }
  const privateUrl = {
    devnet: serverEnv.SUI_DEVNET_RPC_URL,
    testnet: serverEnv.SUI_TESTNET_RPC_URL,
    mainnet: serverEnv.SUI_MAINNET_RPC_URL
  }[network];
  return secureUrl(privateUrl, SUI_NETWORKS[network].rpcUrl, "Sui RPC URL");
}
