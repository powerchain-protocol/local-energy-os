import type { PowerChainNetwork, SolanaRuntimeConfig } from "@powerchain/config";

export const SOLANA_PROGRAM_IDS = {
  system: "11111111111111111111111111111111",
  token: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  token2022: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  associatedToken: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  computeBudget: "ComputeBudget111111111111111111111111111111",
  metaplexTokenMetadata: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
} as const;

export const SOLANA_PUBLIC_ENDPOINTS = {
  devnet: { rpc: "https://api.devnet.solana.com", ws: "wss://api.devnet.solana.com" },
  "mainnet-beta": { rpc: "https://api.mainnet.solana.com", ws: "wss://api.mainnet.solana.com" },
} as const;

function heliusEndpoints(cluster: PowerChainNetwork, apiKey: string) {
  return cluster === "devnet"
    ? { rpc: `https://devnet.helius-rpc.com/?api-key=${apiKey}`, ws: `wss://atlas-devnet.helius-rpc.com/?api-key=${apiKey}` }
    : { rpc: `https://mainnet.helius-rpc.com/?api-key=${apiKey}`, ws: `wss://atlas-mainnet.helius-rpc.com/?api-key=${apiKey}` };
}

export function resolveSolanaRuntime(env: NodeJS.ProcessEnv = process.env): SolanaRuntimeConfig {
  const cluster = (env.SOLANA_CLUSTER || env.POWERCHAIN_NETWORK || "devnet") as PowerChainNetwork;
  if (cluster !== "devnet" && cluster !== "mainnet-beta") throw new Error(`UNSUPPORTED_SOLANA_CLUSTER:${cluster}`);
  const heliusKey = env.HELIUS_API_KEY?.trim();
  const heliusEnabled = env.HELIUS_ENABLED === "true" && Boolean(heliusKey);
  const publicEndpoint = SOLANA_PUBLIC_ENDPOINTS[cluster];
  const configuredPublicRpc = cluster === "devnet" ? env.SOLANA_DEVNET_RPC_URL?.trim() : env.SOLANA_MAINNET_RPC_URL?.trim();
  const configuredPublicWs = cluster === "devnet" ? env.SOLANA_DEVNET_WS_URL?.trim() : env.SOLANA_MAINNET_WS_URL?.trim();
  const configuredHeliusRpc = cluster === "devnet" ? env.HELIUS_DEVNET_RPC_URL?.trim() : env.HELIUS_MAINNET_RPC_URL?.trim();
  const configuredHeliusWs = cluster === "devnet" ? env.HELIUS_DEVNET_WS_URL?.trim() : env.HELIUS_MAINNET_WS_URL?.trim();
  const helius = heliusKey ? heliusEndpoints(cluster, heliusKey) : undefined;
  const rpcUrl = env.SOLANA_RPC_URL?.trim() || (heliusEnabled ? configuredHeliusRpc || helius!.rpc : configuredPublicRpc || publicEndpoint.rpc);
  const wsUrl = env.SOLANA_WS_URL?.trim() || (heliusEnabled ? configuredHeliusWs || helius!.ws : configuredPublicWs || publicEndpoint.ws);
  const provider = env.SOLANA_RPC_URL?.trim() ? "custom" : heliusEnabled ? "helius" : "public";
  const energyRwaProgramId = env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID?.trim() || (cluster === "devnet" ? env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID_DEVNET?.trim() : env.POWERCHAIN_ENERGY_RWA_PROGRAM_ID_MAINNET?.trim());
  const pwrcMint = env.PWRC_MINT?.trim() || (cluster === "devnet" ? env.PWRC_MINT_DEVNET?.trim() : env.PWRC_MINT_MAINNET?.trim());
  return { cluster, provider, rpcUrl, wsUrl, energyRwaProgramId: energyRwaProgramId || undefined, pwrcMint: pwrcMint || undefined };
}
