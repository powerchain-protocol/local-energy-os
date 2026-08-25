import { withApi } from "../../../../../lib/api";
import { requireOrganization } from "../../../../../lib/context";
import { commandCenter } from "../../../../../lib/command-center";
export async function GET(req: Request) { return withApi(req, async ({ context, runtime }) => commandCenter(requireOrganization(context), runtime)); }
