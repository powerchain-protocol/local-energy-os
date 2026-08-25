import { withApi } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";
import { listParticipants } from "../../../../../lib/participants";
export async function GET(req: Request) { return withApi(req, async ({ context }) => ({ items: await listParticipants(requireOrganization(context), "PROSUMER") })); }
