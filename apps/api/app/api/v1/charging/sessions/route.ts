import { withApi } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";
import { listChargingSessions } from "../../../../../lib/infrastructure";
export async function GET(req: Request) { return withApi(req, async ({ context }) => ({ items: await listChargingSessions(requireOrganization(context)) })); }
