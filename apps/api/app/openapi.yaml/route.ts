import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
  const candidates = [
    path.resolve(process.cwd(), "../../packages/api/swagger/openapi.yaml"),
    path.resolve(process.cwd(), "packages/api/swagger/openapi.yaml"),
  ];
  let body: string | undefined;
  for (const file of candidates) {
    try { body = await readFile(file, "utf8"); break; } catch {}
  }
  if (!body) return new Response("OpenAPI specification is unavailable", { status: 503 });
  return new Response(body, { headers: { "content-type": "application/yaml; charset=utf-8", "cache-control": "public, max-age=300, stale-while-revalidate=3600" } });
}
