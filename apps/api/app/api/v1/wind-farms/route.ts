import { withApi } from "../../../../lib/api";
import { requireOrganization } from "../../../../lib/context";
import { listWindFarms } from "../../../../lib/infrastructure";
export async function GET(req: Request) { return withApi(req, async ({ context }) => ({ items: await listWindFarms(requireOrganization(context)) })); }
