import { withApi } from "../../../../../lib/api";
import { getPrismaClient } from "@powerchain/database";
export async function GET(req: Request) {
  return withApi(req, async ({ runtime }) => {
    let database: "OPERATIONAL" | "UNAVAILABLE" = "OPERATIONAL";
    try { await getPrismaClient().$queryRawUnsafe("SELECT 1"); } catch { database = "UNAVAILABLE"; }
    return {
      overall: database === "OPERATIONAL" ? "OPERATIONAL" : "DEGRADED",
      services: {
        api: "OPERATIONAL",
        database,
        solana: process.env.SOLANA_RPC_URL ? "CONFIGURED" : "UNAVAILABLE",
        sui: process.env.SUI_RPC_URL ? "CONFIGURED" : "UNAVAILABLE",
        pyth: process.env.PYTH_ENABLED === "true" ? "CONFIGURED" : "DISABLED",
        chainlink: process.env.CHAINLINK_ENABLED === "true" ? "CONFIGURED" : "DISABLED",
        x402: process.env.X402_ENABLED === "true" ? "CONFIGURED" : "DISABLED",
        cctp: process.env.CCTP_ENABLED === "true" ? "CONFIGURED" : "DISABLED",
      },
      runtime: { operatingMode: runtime.operatingMode, dataMode: runtime.dataMode, network: runtime.network },
    };
  });
}
