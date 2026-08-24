export type TransactionState = "draft" | "awaiting-signature" | "submitted" | "confirmed" | "failed" | "reconciliation-required";
export interface TransactionReceipt { id: string; network: string; signature?: string; state: TransactionState; createdAt: string; }
