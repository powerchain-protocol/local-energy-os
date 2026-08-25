import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env"]) {
  const candidate = path.join(root, file);
  if (existsSync(candidate)) process.loadEnvFile(candidate);
}

const environment = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();
const action = process.argv[2] ?? "doctor";

function encode(value) { return encodeURIComponent(value); }
function pgVarsUrl() {
  const anyPg = ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE", "PGSCHEMA"].some(name => process.env[name] !== undefined);
  if (!anyPg && environment === "production") return "";
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const user = process.env.PGUSER?.trim() || "postgres";
  const password = process.env.PGPASSWORD ?? "postgres";
  const database = process.env.PGDATABASE?.trim() || "powerchain";
  const schema = process.env.PGSCHEMA?.trim() || "public";
  return `postgresql://${encode(user)}:${encode(password)}@${host}:${port}/${encode(database)}?schema=${encode(schema)}`;
}
function resolveDatasource() {
  const direct = process.env.DIRECT_URL?.trim();
  if (direct) return { url: direct, source: "DIRECT_URL" };
  const runtime = process.env.DATABASE_URL?.trim();
  if (runtime) return { url: runtime, source: "DATABASE_URL" };
  const pg = pgVarsUrl();
  if (pg) return { url: pg, source: Object.keys(process.env).some(key => key.startsWith("PG") && process.env[key] !== undefined) ? "PG_VARS" : "DEVELOPMENT_FALLBACK" };
  return { url: "", source: "NONE" };
}
function parseTarget(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["postgresql:", "postgres:"].includes(url.protocol)) return null;
    return { url, host: url.hostname, port: Number(url.port || 5432), database: url.pathname.replace(/^\//, "") || "postgres" };
  } catch { return null; }
}
function localHost(host) { return ["localhost", "127.0.0.1", "::1"].includes(host); }
function run(command, args, inherit = true) {
  const result = spawnSync(command, args, { cwd: root, stdio: inherit ? "inherit" : "pipe", encoding: "utf8", env: process.env });
  if (result.error) return { status: 127, error: result.error, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  return result;
}
function connect(host, port, timeoutMs = 1200) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const finish = ok => { if (settled) return; settled = true; socket.destroy(); resolve(ok); };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}
async function waitFor(target, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await connect(target.host, target.port)) return true;
    await new Promise(resolve => setTimeout(resolve, 750));
  }
  return false;
}

const datasource = resolveDatasource();
const target = parseTarget(datasource.url);
if (!target) {
  console.error("[PowerChain DB] No valid PostgreSQL datasource is available.");
  console.error("  Development: run `pnpm env:setup` or use the built-in 127.0.0.1 defaults.");
  console.error("  Managed DB: set DIRECT_URL and DATABASE_URL.");
  console.error("  Production never falls back to localhost.");
  process.exit(1);
}

async function doctor(requireReachable = true) {
  console.log(`[PowerChain DB] source ${datasource.source}`);
  console.log(`[PowerChain DB] target ${target.host}:${target.port}/${target.database}${localHost(target.host) ? " (local)" : " (managed)"}`);
  const reachable = await connect(target.host, target.port);
  console.log(`[PowerChain DB] connectivity ${reachable ? "reachable" : "unreachable"}`);
  if (!reachable && requireReachable) {
    if (localHost(target.host)) {
      console.error("[PowerChain DB] Local PostgreSQL is not running.");
      console.error("  Run: pnpm infra:doctor && pnpm db:up && pnpm db:wait");
      console.error("  Or set DIRECT_URL/DATABASE_URL for Supabase or another managed PostgreSQL service.");
    } else {
      console.error("[PowerChain DB] Managed PostgreSQL is unreachable. Check URL, TLS/pooler mode, firewall/VPN and provider status.");
    }
    process.exit(1);
  }
  return reachable;
}

switch (action) {
  case "doctor": await doctor(true); break;
  case "status": await doctor(false); break;
  case "up": {
    if (!localHost(target.host)) { console.log("[PowerChain DB] Managed datasource configured; no local service needs to be started."); await doctor(true); break; }
    if (await connect(target.host, target.port)) { console.log("[PowerChain DB] Local PostgreSQL is already reachable."); break; }
    const result = run("node", ["tools/infra.mjs", "up"]);
    if (result.status !== 0) process.exit(result.status ?? 1);
    if (!await waitFor(target)) { console.error(`[PowerChain DB] PostgreSQL did not become reachable at ${target.host}:${target.port} within 45 seconds.`); process.exit(1); }
    console.log("[PowerChain DB] PostgreSQL is ready.");
    break;
  }
  case "wait":
    if (!await waitFor(target)) { console.error("[PowerChain DB] Timed out waiting for PostgreSQL."); process.exit(1); }
    console.log("[PowerChain DB] PostgreSQL is reachable.");
    break;
  case "down":
    if (!localHost(target.host)) { console.log("[PowerChain DB] Managed datasource configured; nothing to stop locally."); break; }
    process.exit(run("node", ["tools/infra.mjs", "down"]).status ?? 1);
  case "setup": {
    if (environment === "production") { console.error("[PowerChain DB] db:setup is development-only. Use prisma:migrate:deploy in production."); process.exit(1); }
    if (!existsSync(path.join(root, ".env.local")) && !existsSync(path.join(root, ".env"))) run("node", ["tools/env-setup.mjs"]);
    if (localHost(target.host) && !await connect(target.host, target.port)) {
      const result = run("node", ["tools/infra.mjs", "up"]);
      if (result.status !== 0) process.exit(result.status ?? 1);
      if (!await waitFor(target)) process.exit(1);
    }
    await doctor(true);
    for (const [command, args] of [["pnpm", ["prisma:validate"]], ["pnpm", ["prisma:generate"]]]) {
      const result = run(command, args); if (result.status !== 0) process.exit(result.status ?? 1);
    }
    const migrationsDir = path.join(root, "prisma/migrations");
    const hasMigration = existsSync(migrationsDir) && readdirSync(migrationsDir).some(name => name !== ".gitkeep" && name !== "README.md");
    const command = hasMigration
      ? ["prisma", ["migrate", "deploy", "--config", "prisma.config.ts"]]
      : ["prisma", ["migrate", "dev", "--config", "prisma.config.ts", "--name", "init"]];
    const result = run(command[0], command[1]);
    if (result.status !== 0) process.exit(result.status ?? 1);
    run("pnpm", ["prisma:generate"]);
    console.log("[PowerChain DB] Development database setup complete.");
    break;
  }
  default: console.error(`[PowerChain DB] Unknown action: ${action}`); process.exit(1);
}
