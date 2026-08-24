import { z } from "zod";

export const solanaProgramConfigSchema = z.object({
  cluster: z.enum(["devnet", "mainnet-beta"]),
  programId: z.string().min(32).max(44),
  rpcUrl: z.string().url(),
  commitment: z.enum(["processed", "confirmed", "finalized"]).default("confirmed")
});
