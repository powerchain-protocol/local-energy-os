import { withApi } from "../../../../../lib/api";
import { collectSystemStatus } from "../../../../../lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withApi(req, async ({ runtime }) => {
    const status = await collectSystemStatus(runtime, "shallow");
    return {
      overall: status.overall,
      generatedAt: status.generatedAt,
      services: Object.fromEntries(status.services.map(service => [service.id, service.state])),
      runtime: status.runtime,
    };
  });
}
