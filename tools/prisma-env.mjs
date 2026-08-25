import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env"]) {
  const candidate = path.join(root, file);
  if (existsSync(candidate)) process.loadEnvFile(candidate);
}

const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/powerchain?schema=public";
const environment = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();
const direct = process.env.DIRECT_URL?.trim();
const runtime = process.env.DATABASE_URL?.trim();
const shadow = process.env.SHADOW_DATABASE_URL?.trim();
const effective = direct || runtime || (environment === "production" ? "" : LOCAL_DATABASE_URL);

function describe(url) {
  if (!url) return "not configured";
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}${parsed.pathname}`;
  } catch {
    return "configured but invalid URL syntax";
  }
}

console.log("PowerChain Prisma environment");
console.log(`  repository: ${root}`);
console.log(`  environment: ${environment}`);
console.log(`  .env.local: ${existsSync(path.join(root, ".env.local")) ? "present" : "absent"}`);
console.log(`  .env: ${existsSync(path.join(root, ".env")) ? "present" : "absent"}`);
console.log(`  DIRECT_URL: ${describe(direct)}`);
console.log(`  DATABASE_URL: ${describe(runtime)}`);
console.log(`  SHADOW_DATABASE_URL: ${describe(shadow)}`);
console.log(`  CLI datasource: ${describe(effective)}`);

if (!effective) {
  console.error("\nNo Prisma datasource URL is available.");
  console.error("Run `pnpm env:setup`, or configure DIRECT_URL/DATABASE_URL in the shell or CI environment.");
  process.exit(1);
}
if (environment === "production" && !direct && !runtime) {
  console.error("\nProduction requires an explicit DIRECT_URL or DATABASE_URL; localhost fallback is disabled.");
  process.exit(1);
}
if (process.argv.includes("--require-shadow") && !shadow) {
  console.error("\nSHADOW_DATABASE_URL is required by this repository policy for migrate dev against managed databases.");
  process.exit(1);
}
