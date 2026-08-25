import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env"]) {
  const candidate = path.join(root, file);
  if (existsSync(candidate)) process.loadEnvFile(candidate);
}
const environment = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();
const encode = value => encodeURIComponent(value);
function pgVarsUrl() {
  if (environment === "production" && !process.env.PGHOST) return "";
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const user = process.env.PGUSER?.trim() || "postgres";
  const password = process.env.PGPASSWORD ?? "postgres";
  const database = process.env.PGDATABASE?.trim() || "powerchain";
  const schema = process.env.PGSCHEMA?.trim() || "public";
  return `postgresql://${encode(user)}:${encode(password)}@${host}:${port}/${encode(database)}?schema=${encode(schema)}`;
}
const direct = process.env.DIRECT_URL?.trim();
const runtime = process.env.DATABASE_URL?.trim();
const shadow = process.env.SHADOW_DATABASE_URL?.trim();
const effective = direct || runtime || pgVarsUrl();
const source = direct ? "DIRECT_URL" : runtime ? "DATABASE_URL" : effective ? (process.env.PGHOST ? "PG_VARS" : "DEVELOPMENT_FALLBACK") : "NONE";
function describe(url) {
  if (!url) return "not configured";
  try { const parsed = new URL(url); return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`; }
  catch { return "configured but invalid URL syntax"; }
}
console.log("PowerChain Prisma environment");
console.log(`  repository: ${root}`);
console.log(`  environment: ${environment}`);
console.log(`  .env.local: ${existsSync(path.join(root, ".env.local")) ? "present" : "absent"}`);
console.log(`  .env: ${existsSync(path.join(root, ".env")) ? "present" : "absent"}`);
console.log(`  DIRECT_URL: ${describe(direct)}`);
console.log(`  DATABASE_URL: ${describe(runtime)}`);
console.log(`  SHADOW_DATABASE_URL: ${describe(shadow)}`);
console.log(`  CLI datasource source: ${source}`);
console.log(`  CLI datasource: ${describe(effective)}`);
if (!effective) { console.error("\nNo Prisma datasource URL is available."); process.exit(1); }
if (environment === "production" && !direct && !runtime && !process.env.PGHOST) { console.error("\nProduction requires an explicit PostgreSQL datasource."); process.exit(1); }
if (process.argv.includes("--require-shadow") && !shadow) { console.error("\nSHADOW_DATABASE_URL is required by this repository policy for managed migrate dev workflows."); process.exit(1); }
