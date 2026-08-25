import { ok } from "../../../../../lib/http"; import {appCatalog} from "@powerchain/saas"; export async function GET(req:Request){return ok(req,{apps:appCatalog})}
