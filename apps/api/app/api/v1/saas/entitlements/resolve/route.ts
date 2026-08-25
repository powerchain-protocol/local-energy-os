import { readJson, withApi } from "../../../../../../lib/api";
import { resolveEntitlement, isAppId, isPlanId } from "@powerchain/saas";
import { ApiValidationError } from "@powerchain/validation";

export async function POST(req: Request) {
  return withApi(req, async () => {
    const body = (await readJson(req)) as Record<string, unknown>;
    if (!isPlanId(body.plan)) {
      throw new ApiValidationError("plan is invalid", "plan");
    }
    if (!isAppId(body.app)) {
      throw new ApiValidationError("app is invalid", "app");
    }
    const feature = typeof body.feature === "string" ? body.feature : undefined;
    const overrides =
      body.overrides && typeof body.overrides === "object" && !Array.isArray(body.overrides)
        ? (body.overrides as Record<string, boolean>)
        : undefined;
    return resolveEntitlement({
      plan: body.plan,
      app: body.app,
      feature,
      overrides,
    });
  });
}
