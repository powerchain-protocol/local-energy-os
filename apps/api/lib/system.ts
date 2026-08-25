import net from "node:net";
import { getPrismaClient, resolveRuntimeDatabaseUrl } from "@powerchain/database";
import { resolveSolanaRuntime } from "@powerchain/svm";
import {
  managementStatus,
  parseBoolean,
  redactUrlHost,
  resolveOverallState,
  type SystemPublicConfig,
  type SystemServiceStatus,
  type SystemStatusSnapshot,
} from "@powerchain/system-management";
import type { RuntimeConfig } from "@powerchain/config";

const now = () => new Date().toISOString();

function parsePostgres(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!["postgresql:", "postgres:"].includes(parsed.protocol)) return undefined;
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 5432),
      database: parsed.pathname.replace(/^\//, "").split("?")[0] || "postgres",
    };
  } catch {
    return undefined;
  }
}

function parseRedis(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!["redis:", "rediss:"].includes(parsed.protocol)) return undefined;
    return { host: parsed.hostname, port: Number(parsed.port || 6379) };
  } catch {
    return undefined;
  }
}

function tcpProbe(host: string, port: number, timeoutMs = 900): Promise<{ ok: boolean; latencyMs: number }> {
  const startedAt = Date.now();
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ ok, latencyMs: Date.now() - startedAt });
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function solanaProbe(rpcUrl: string, timeoutMs = 1_500): Promise<{ ok: boolean; latencyMs: number }> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: "powerchain-health", method: "getHealth" }),
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await response.json().catch(() => null) as { result?: unknown; error?: unknown } | null;
    return { ok: response.ok && body?.result === "ok" && !body?.error, latencyMs: Date.now() - startedAt };
  } catch {
    return { ok: false, latencyMs: Date.now() - startedAt };
  } finally {
    clearTimeout(timer);
  }
}

export function publicSystemConfig(runtime: RuntimeConfig): SystemPublicConfig {
  const runtimeDb = parsePostgres(process.env.DATABASE_URL?.trim());
  const migrationDb = parsePostgres(process.env.DIRECT_URL?.trim());
  const pgHost = process.env.PGHOST?.trim();
  const pgPort = Number(process.env.PGPORT || 5432);
  const pgDatabase = process.env.PGDATABASE?.trim();
  const developmentFallback = runtime.environment === "development" && !runtimeDb && !migrationDb && !pgHost;
  const db = runtimeDb || migrationDb || (pgHost ? { host: pgHost, port: pgPort, database: pgDatabase || "powerchain" } : undefined) || (developmentFallback ? { host: "127.0.0.1", port: 5432, database: "powerchain" } : undefined);
  const source: SystemPublicConfig["database"]["source"] = runtimeDb
    ? "DATABASE_URL"
    : migrationDb
      ? "DIRECT_URL"
      : pgHost
        ? "PG_VARS"
        : developmentFallback
          ? "DEVELOPMENT_FALLBACK"
          : "NONE";
  const redis = parseRedis(process.env.REDIS_URL?.trim());
  const solana = resolveSolanaRuntime(process.env);
  return {
    version: runtime.version,
    environment: runtime.environment,
    operatingMode: runtime.operatingMode,
    dataMode: runtime.dataMode,
    writeMode: runtime.writeMode,
    network: runtime.network,
    database: {
      configured: Boolean(db),
      source,
      host: db?.host,
      port: db?.port,
      database: db?.database,
    },
    redis: { configured: Boolean(redis), host: redis?.host, port: redis?.port },
    solana: {
      cluster: solana.cluster,
      provider: solana.provider,
      rpcHost: redactUrlHost(solana.rpcUrl),
      websocketHost: redactUrlHost(solana.wsUrl),
      energyRwaProgramConfigured: Boolean(solana.energyRwaProgramId),
      pwrcMintConfigured: Boolean(solana.pwrcMint),
      heliusEnabled: parseBoolean(process.env.HELIUS_ENABLED),
    },
    features: {
      localMarket: parseBoolean(process.env.FEATURE_LOCAL_MARKET, true),
      flexibility: parseBoolean(process.env.FEATURE_FLEXIBILITY, true),
      depin: parseBoolean(process.env.FEATURE_DEPIN, true),
      evCharging: parseBoolean(process.env.FEATURE_EV_CHARGING, true),
      powerPlants: parseBoolean(process.env.FEATURE_POWER_PLANTS, true),
      wind: parseBoolean(process.env.FEATURE_WIND, true),
      supplyChain: parseBoolean(process.env.FEATURE_SUPPLY_CHAIN, true),
      saas: parseBoolean(process.env.FEATURE_SAAS, true),
      x402: parseBoolean(process.env.X402_ENABLED),
      cctp: parseBoolean(process.env.CCTP_ENABLED),
    },
  };
}

export async function collectSystemStatus(runtime: RuntimeConfig, probe: "shallow" | "deep" = "shallow"): Promise<SystemStatusSnapshot> {
  const observedAt = now();
  const config = publicSystemConfig(runtime);
  const services: SystemServiceStatus[] = [
    { id: "api", name: "API", state: "OPERATIONAL", configured: true, critical: true, observedAt },
  ];

  const runtimeDatabaseUrl = resolveRuntimeDatabaseUrl();
  if (!runtimeDatabaseUrl) {
    services.push({ id: "database", name: "Database", state: "UNCONFIGURED", configured: false, critical: true, observedAt, message: "DATABASE_URL is required in production." });
  } else {
    const startedAt = Date.now();
    try {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("DATABASE_PROBE_TIMEOUT")), 1_500));
      await Promise.race([getPrismaClient().$queryRawUnsafe("SELECT 1"), timeout]);
      services.push({ id: "database", name: "Database", state: "OPERATIONAL", configured: true, critical: true, observedAt, latencyMs: Date.now() - startedAt, details: { source: config.database.source } });
    } catch {
      services.push({ id: "database", name: "Database", state: "UNAVAILABLE", configured: true, critical: true, observedAt, latencyMs: Date.now() - startedAt, message: "PostgreSQL query probe failed or timed out.", details: { source: config.database.source } });
    }
  }

  const redis = parseRedis(process.env.REDIS_URL?.trim());
  if (!redis) {
    services.push({ id: "redis", name: "Redis", state: "UNCONFIGURED", configured: false, critical: false, observedAt, message: "Realtime cross-process event bus is not configured." });
  } else if (probe === "deep") {
    const result = await tcpProbe(redis.host, redis.port);
    services.push({ id: "redis", name: "Redis", state: result.ok ? "OPERATIONAL" : "UNAVAILABLE", configured: true, critical: false, observedAt, latencyMs: result.latencyMs });
  } else {
    services.push({ id: "redis", name: "Redis", state: "UNKNOWN", configured: true, critical: false, observedAt, message: "Configured; use ?probe=deep for connectivity." });
  }

  const solana = resolveSolanaRuntime(process.env);
  if (probe === "deep") {
    const result = await solanaProbe(solana.rpcUrl);
    services.push({ id: "solana", name: "Solana", state: result.ok ? "OPERATIONAL" : "UNAVAILABLE", configured: true, critical: false, observedAt, latencyMs: result.latencyMs, details: { cluster: solana.cluster, provider: solana.provider } });
  } else {
    services.push({ id: "solana", name: "Solana", state: "UNKNOWN", configured: true, critical: false, observedAt, message: "Configured; use ?probe=deep for RPC health.", details: { cluster: solana.cluster, provider: solana.provider } });
  }

  services.push(
    { id: "realtime", name: "Realtime Gateway", state: process.env.REALTIME_ENABLED === "false" ? "DISABLED" : redis ? "UNKNOWN" : "UNCONFIGURED", configured: Boolean(redis), critical: false, observedAt },
    { id: "grpc", name: "gRPC Gateway", state: process.env.GRPC_ENABLED === "true" ? "UNKNOWN" : "DISABLED", configured: process.env.GRPC_ENABLED === "true", critical: false, observedAt },
    { id: "telemetry", name: "Telemetry", state: "UNKNOWN", configured: true, critical: false, observedAt },
    { id: "market", name: "Local Market", state: parseBoolean(process.env.FEATURE_LOCAL_MARKET, true) ? "UNKNOWN" : "DISABLED", configured: true, critical: false, observedAt },
    { id: "settlement", name: "Settlement", state: runtime.operatingMode === "MAINTENANCE" ? "MAINTENANCE" : "UNKNOWN", configured: true, critical: true, observedAt },
    { id: "sui", name: "Sui", state: process.env.SUI_RPC_URL?.trim() ? "UNKNOWN" : "UNCONFIGURED", configured: Boolean(process.env.SUI_RPC_URL?.trim()), critical: false, observedAt },
    { id: "oracles", name: "Oracles", state: parseBoolean(process.env.PYTH_ENABLED, true) || parseBoolean(process.env.CHAINLINK_ENABLED) ? "UNKNOWN" : "DISABLED", configured: true, critical: false, observedAt },
    { id: "rewards", name: "Rewards", state: "UNKNOWN", configured: true, critical: false, observedAt },
    { id: "storage", name: "Storage", state: "UNKNOWN", configured: true, critical: false, observedAt },
  );

  const management = managementStatus(services);
  if (runtime.writeMode !== "enabled") {
    management.writesAllowed = false;
    management.reasons.push(`write-mode-${runtime.writeMode}`);
  }
  if (runtime.operatingMode === "READ_ONLY" || runtime.operatingMode === "MAINTENANCE") {
    management.writesAllowed = false;
    management.reasons.push(`operating-mode-${runtime.operatingMode.toLowerCase()}`);
  }

  return {
    overall: resolveOverallState(services),
    generatedAt: now(),
    probe,
    runtime,
    services,
    management,
  };
}
