import { withApi } from "../../../../../lib/api";
import { proxyOperations } from "../../../../../lib/operations-gateway";
export async function POST(req: Request) { return withApi(req, execution => proxyOperations(req, execution, "/actions/prepare"), { status: 201 }); }
