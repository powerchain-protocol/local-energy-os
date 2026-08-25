import { withApi } from "../../../../lib/api";
export async function GET(req: Request) { return withApi(req, async ({ runtime }) => ({ service: "powerchain-api", version: runtime.version, status: "OPERATIONAL", mode: runtime.operatingMode })); }
