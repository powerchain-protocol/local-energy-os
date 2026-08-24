export type WalletNetwork = "solana" | "sui" | "evm";

export type WalletAssetBalance = { symbol: string; amount: number; valueUsd?: number };
export type WalletSnapshot = {
  address: string;
  network: WalletNetwork;
  totalUsd?: number;
  assets: WalletAssetBalance[];
  signatures?: Array<{ signature: string; status: string; blockTime?: string }>;
  state: "available" | "degraded" | "unavailable";
  observedAt: string;
};

export type ConnectedWallet = {
  address: string;
  network: WalletNetwork;
  provider: string;
  connectedAt: string;
};

export type WalletProviderAdapter = {
  id: string;
  name: string;
  network: WalletNetwork;
  description?: string;
  detect(): boolean;
  connect(): Promise<string>;
  disconnect?(): Promise<void>;
};
