import { withApi } from "../../../../../lib/api";
export async function GET(req: Request) {
  return withApi(req, async () => ({
    providers: [
      { provider: "PYTH", enabled: process.env.PYTH_ENABLED === "true", state: process.env.PYTH_ENABLED === "true" ? "CONFIGURED" : "DISABLED" },
      { provider: "CHAINLINK", enabled: process.env.CHAINLINK_ENABLED === "true", state: process.env.CHAINLINK_ENABLED === "true" ? "CONFIGURED" : "DISABLED" },
    ],
    policy: "Price-sensitive operations require a fresh approved provider; no synthetic fallback values are generated.",
  }));
}
