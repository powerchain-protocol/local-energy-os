import { withApi } from "../../../../../lib/api";
import { listGridAreas } from "../../../../../lib/infrastructure";
export async function GET(req: Request) { return withApi(req, async () => ({ items: await listGridAreas() })); }
