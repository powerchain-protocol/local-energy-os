import { readJson, withApi } from "../../../../../../lib/api";
import { quoteBridgeToSui } from "@powerchain/pwrc";
import { parseBigIntString } from "@powerchain/validation";

export async function POST(req: Request) {
  return withApi(req, async () => {
    const body = (await readJson(req)) as Record<string, unknown>;
    if (process.env.PWRC_BRIDGE_ENABLED !== "true") {
      throw Object.assign(new Error("PWRC bridge is disabled"), {
        code: "PWRC_BRIDGE_DISABLED",
        status: 503,
      });
    }
    return quoteBridgeToSui(
      parseBigIntString(body.amountBaseUnits, "amountBaseUnits", 1n),
    );
  });
}
