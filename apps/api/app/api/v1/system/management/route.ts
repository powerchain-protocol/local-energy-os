import { withApi } from "../../../../../lib/api";
import { collectSystemStatus } from "../../../../../lib/system";
import { degradedPolicy } from "@powerchain/system-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withApi(req, async ({ runtime }) => {
    const status = await collectSystemStatus(runtime, "shallow");
    return {
      ...status.management,
      operatingMode: runtime.operatingMode,
      writeMode: runtime.writeMode,
      policies: Object.fromEntries(status.services.map(service => [service.id, degradedPolicy(service.id, service.state)])),
    };
  });
}
