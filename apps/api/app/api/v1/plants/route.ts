import { withApi } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { listPlants } from "../../../../lib/infrastructure";
export async function GET(req: Request) { return withApi(req, async ({ context }) => ({ items: await listPlants(requireOrganization(context)) })); }
