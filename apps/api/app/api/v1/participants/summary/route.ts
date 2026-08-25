import { withApi } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";
import { participantSummary } from "../../../../../lib/participants";
export async function GET(req: Request) { return withApi(req, async ({ context }) => participantSummary(requireOrganization(context))); }
