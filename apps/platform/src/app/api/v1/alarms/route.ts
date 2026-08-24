import { alarms } from "@/data/alarms";
export async function GET() { return Response.json({ ok: true, data: alarms, count: alarms.length }); }
