import { PWRC } from "@powerchain/pwrc";
export const SVM_INFRASTRUCTURE = {
  primaryNetwork: "SOLANA",
  clients: ["HELIUS", "POWERCHAIN_AGAVE_RPC", "SOLANA_RPC", "FALLBACK_RPC"],
  programFrameworks: ["ANCHOR", "PINOCCHIO"],
  pwrcMint: PWRC.mint,
} as const;
