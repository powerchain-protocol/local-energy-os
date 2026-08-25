import { withApi } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";
import { listChargingStations } from "../../../../../lib/infrastructure";
export async function GET(req: Request) { return withApi(req, async ({ context }) => ({ items: await listChargingStations(requireOrganization(context)) })); }
