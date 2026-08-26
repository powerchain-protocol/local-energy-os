import type { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { BackendConfig } from "../config.js";
import { probeSolana, probeSui } from "../services/chains.js";
export function registerHealthRoutes(router: Router, config: BackendConfig, prisma: PrismaClient) {
  router.get("/health", async (_req, res) => {
    const checks: Record<string, { status: "ok" | "unavailable" | "unconfigured"; latencyMs?: number; mode?: string }> = {};
    const started = Date.now();
    try { await prisma.$queryRawUnsafe("SELECT 1"); checks.database = { status: "ok", latencyMs: Date.now() - started }; }
    catch { checks.database = { status: "unavailable", latencyMs: Date.now() - started }; }
    checks.supabaseRealtime = { status: config.SUPABASE_REALTIME_ENABLED === "true" && config.SUPABASE_URL ? "ok" : "unconfigured" };
    checks.ems = { status: checks.database.status === "ok" ? "ok" : "unavailable" };
    checks.iot = { status: checks.database.status === "ok" ? "ok" : "unavailable" };
    checks.depin = { status: checks.database.status === "ok" ? "ok" : "unavailable" };
    checks.solana = await probeSolana(config);
    checks.sui = await probeSui(config);
    checks.marketData = { status: config.MARKET_DATA_BASE_URL ? "ok" : "unconfigured" };
    const degraded = Object.values(checks).some(check => check.status === "unavailable");
    res.status(degraded ? 503 : 200).json({ data: { status: degraded ? "degraded" : "ok", service: "powerchain-operations-backend", version: "1.0.0", checks }, meta: { requestId: res.locals.requestId, generatedAt: new Date().toISOString() } });
  });
}
