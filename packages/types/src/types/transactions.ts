export type ChainFamily = "solana" | "sui" | "evm";
export type TransactionStatus = "draft" | "requires_signature" | "submitted" | "confirmed" | "failed";
export interface ChainTransaction { id: string; chain: ChainFamily; from: string; to: string; amount: string; decimals: number; asset: string; status: TransactionStatus; signature?: string; }
