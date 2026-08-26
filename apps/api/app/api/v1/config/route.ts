import { withApi } from "../../../../lib/api";
import { publicSystemConfig } from "../../../../lib/system";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withApi(req, async ({ runtime }) => publicSystemConfig(runtime));
}
