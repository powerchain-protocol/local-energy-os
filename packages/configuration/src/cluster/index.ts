export type SolanaCluster = "mainnet-beta" | "devnet" | "testnet" | "localnet";
export const clusterEndpoints: Record<SolanaCluster, string> = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
  localnet: "http://127.0.0.1:8899",
};
export function resolveCluster(value?: string): SolanaCluster { return value && value in clusterEndpoints ? value as SolanaCluster : "devnet"; }
