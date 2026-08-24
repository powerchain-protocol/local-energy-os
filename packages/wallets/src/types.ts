export type WalletFamily = "solana" | "sui" | "walletconnect" | "hardware" | "custodial";
export interface WalletAccount { address: string; family: WalletFamily; label?: string; connected: boolean; }
