import { withApi } from "../../../../../lib/api";
import { collectSystemStatus } from "../../../../../lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const probe = new URL(req.url).searchParams.get("probe") === "deep" ? "deep" : "shallow";
  return withApi(req, async ({ runtime }) => collectSystemStatus(runtime, probe));
}
