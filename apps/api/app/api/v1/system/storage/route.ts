import { STORAGE_CAPABILITIES } from "@powerchain/storage";
import { withApi } from "../../../../../lib/api";
export async function GET(req: Request) { return withApi(req, async () => STORAGE_CAPABILITIES); }
