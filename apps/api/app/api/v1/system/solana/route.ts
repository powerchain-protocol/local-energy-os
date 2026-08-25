import { withApi } from "../../../../../lib/api";
import { SOLANA_PROGRAM_IDS, resolveSolanaRuntime } from "@powerchain/svm";

export async function GET(req: Request) {
  return withApi(req, async () => {
    const runtime = resolveSolanaRuntime(process.env);
    return {
      cluster: runtime.cluster,
      provider: runtime.provider,
      rpcConfigured: Boolean(runtime.rpcUrl),
      websocketConfigured: Boolean(runtime.wsUrl),
      energyRwaProgramId: runtime.energyRwaProgramId ?? null,
      pwrcMint: runtime.pwrcMint ?? null,
      programs: SOLANA_PROGRAM_IDS,
      helius: { enabled: process.env.HELIUS_ENABLED === "true", apiKeyConfigured: Boolean(process.env.HELIUS_API_KEY?.trim()) },
    };
  });
}
