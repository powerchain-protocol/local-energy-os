import "server-only";
import { neon } from "@neondatabase/serverless";
import { serverEnv } from "@/env/server";
import { PowerChainError } from "@/utils/errors";

export function getNeonClient() {
  if (!serverEnv.DATABASE_URL) throw new PowerChainError("DATABASE_URL is not configured", "INTEGRATION_ERROR", 503);
  return neon(serverEnv.DATABASE_URL);
}
export async function checkNeonConnection(): Promise<boolean> {
  try { const sql = getNeonClient(); await sql`select 1 as healthy`; return true; } catch { return false; }
}
