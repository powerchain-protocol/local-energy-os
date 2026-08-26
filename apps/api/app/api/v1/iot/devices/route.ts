import { withApi } from "../../../../../lib/api";
import { proxyOperations } from "../../../../../lib/operations-gateway";
export async function GET(req: Request) { return withApi(req, execution => proxyOperations(req, execution, "/iot/devices")); }
