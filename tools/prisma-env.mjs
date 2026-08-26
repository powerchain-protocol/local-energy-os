import { existsSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { resolveDatabaseEnvironment, parseDatabaseTarget, isLocalDatabaseHost } from "./database-env.mjs";

const { root, environment, directUrl: direct, runtimeUrl: runtime, shadowUrl: shadow, effectiveUrl: effective } = resolveDatabaseEnvironment();
const requireReachable = process.argv.includes("--require-reachable");

function parseDatabaseUrl(url) { return parseDatabaseTarget(url); }

function describe(url) {
  const parsed = parseDatabaseUrl(url);
  if (!url) return "not configured";
  if (!parsed) return "configured but invalid PostgreSQL URL syntax";
  return `${parsed.url.protocol}//${parsed.host}:${parsed.port}/${parsed.database}`;
}

function canConnect(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
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

if (requireReachable) {
  const target = parseDatabaseUrl(effective);
  if (!target) {
    console.error("\nThe effective Prisma datasource is not a valid PostgreSQL URL.");
    process.exit(1);
  }
  const reachable = await canConnect(target.host, target.port);
  console.log(`  connectivity: ${reachable ? "reachable" : "unreachable"}`);
  if (!reachable) {
    console.error(`\nCannot reach PostgreSQL at ${target.host}:${target.port}.`);
    if (isLocalDatabaseHost(target.host)) {
      console.error("Start the local development database with:");
      console.error("  pnpm infra:doctor");
      console.error("  pnpm infra:up");
      console.error("  pnpm infra:status");
    } else {
      console.error("Check DIRECT_URL/DATABASE_URL, network access, TLS/pooler settings, and provider availability.");
    }
    console.error("Alternatively configure DIRECT_URL/DATABASE_URL for a reachable managed PostgreSQL instance.");
    process.exit(1);
  }
}
