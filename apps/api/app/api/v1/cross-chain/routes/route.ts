import { withApi } from "../../../../../lib/api";
export async function GET(req: Request) {
  return withApi(req, async ({ runtime }) => ({
    routes: [
      { asset: "PWRC", source: "SOLANA", destination: "SUI", representation: "wPWRC", enabled: process.env.PWRC_BRIDGE_ENABLED === "true", backing: "1:1" },
      { asset: "ENERGY_RWA", source: "SOLANA", destination: "SUI", enabled: process.env.ENERGY_RWA_SOLANA_ENABLED === "true" && process.env.ENERGY_RWA_SUI_ENABLED === "true", invariant: "active representations <= canonical Wh" },
      { asset: "USDC", source: "SOLANA", destination: "SUI", protocol: "CCTP", enabled: process.env.CCTP_ENABLED === "true" },
    ],
    network: runtime.network,
  }));
}
