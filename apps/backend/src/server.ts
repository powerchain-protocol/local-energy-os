import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { loadBackendConfig } from "./config.js";
import { getOperationsPrisma } from "./db.js";
import { createSupabaseAdmin } from "./services/supabase.js";
import { OperationsRealtimePublisher } from "./services/realtime.js";
import { CompositeOperationsAuthAdapter, InternalOperationsAuthAdapter, SupabaseOperationsAuthAdapter } from "./auth/operations-auth.js";
import { registerConfigRoutes } from "./routes/config.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerEmsRoutes } from "./routes/ems.js";
import { registerIotRoutes } from "./routes/iot.js";
import { registerDepinRoutes } from "./routes/depin.js";
import { registerMarketDataRoutes } from "./routes/market-data.js";
import { registerActionRoutes } from "./routes/actions.js";

export function createBackendApp() {
  const config = loadBackendConfig();
  const prisma = getOperationsPrisma(config);
  const supabase = createSupabaseAdmin(config);
  const auth = new CompositeOperationsAuthAdapter([new InternalOperationsAuthAdapter(config), new SupabaseOperationsAuthAdapter(supabase)]);
  const realtime = new OperationsRealtimePublisher(supabase, config);
  const app = express();
  const allowed = new Set(config.CORS_ORIGINS.split(",").map(value => value.trim()).filter(Boolean));
  app.disable("x-powered-by");
  app.use((req, res, next) => { res.locals.requestId = req.header("x-request-id") ?? crypto.randomUUID(); res.setHeader("x-request-id", res.locals.requestId); res.setHeader("cache-control", "no-store"); next(); });
  app.use(express.json({ limit: "1mb" }));
  app.use(cors({ origin(origin, callback) { if (!origin || allowed.has(origin)) return callback(null, true); return callback(new Error("CORS_ORIGIN_DENIED")); }, credentials: true }));

  const v1 = express.Router();
  registerHealthRoutes(v1, config, prisma);
  registerConfigRoutes(v1, config);
  registerEmsRoutes(v1, auth, prisma, config);
  registerIotRoutes(v1, auth, prisma);
  registerDepinRoutes(v1, auth, prisma);
  registerMarketDataRoutes(v1, auth, config);
  registerActionRoutes(v1, auth, prisma, realtime);
  app.use("/api/v1", v1);

  app.use((_req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found", requestId: res.locals.requestId } }));
  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const candidate = error && typeof error === "object" ? error as { message?: unknown; code?: unknown; status?: unknown; details?: unknown } : {};
    const message = typeof candidate.message === "string" ? candidate.message : "Unexpected backend error";
    const code = typeof candidate.code === "string" ? candidate.code : message === "CORS_ORIGIN_DENIED" ? "CORS_ORIGIN_DENIED" : "INTERNAL_ERROR";
    const status = typeof candidate.status === "number" ? candidate.status : message === "CORS_ORIGIN_DENIED" ? 403 : 500;
    res.status(status).json({ error: { code, message, requestId: res.locals.requestId, ...(candidate.details && typeof candidate.details === "object" ? { details: candidate.details } : {}) } });
  });
  return { app, config, prisma };
}
