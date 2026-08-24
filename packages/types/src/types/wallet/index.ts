export type WalletNetwork = "solana-mainnet" | "solana-devnet";
export type WalletConnectionMode = "injected" | "watch-only";
export type WalletAsset = { symbol: string; name: string; amount: number; decimals: number; usdValue: number | null; mint?: string };
export type WalletSignature = { signature: string; slot: number; blockTime: number | null; status: "confirmed" | "failed" | "unknown" };
export type WalletSnapshot = { address: string; network: WalletNetwork; lamports: number; sol: number; assets: WalletAsset[]; signatures: WalletSignature[]; fetchedAt: string; source: "rpc" | "fallback" };
