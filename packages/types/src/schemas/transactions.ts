import { z } from "zod";
export const transactionSchema = z.object({
  chain: z.enum(["solana", "sui", "evm"]),
  from: z.string().min(20).max(128),
  to: z.string().min(20).max(128),
  amount: z.string().regex(/^\d+(?:\.\d{1,18})?$/),
  decimals: z.number().int().min(0).max(18),
  asset: z.string().min(2).max(16),
});
export type TransactionInput = z.infer<typeof transactionSchema>;
