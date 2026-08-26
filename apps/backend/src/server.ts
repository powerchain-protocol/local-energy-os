import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import { CompositeOperationsAuthAdapter, InternalOperationsAuthAdapter, SupabaseOperationsAuthAdapter } from "./auth/operations-auth.js";
import { loadBackendConfig } from "./config.js";
import { getOperationsPrisma } from "./db.js";
import { registerActionRoutes } from "./routes/actions.js";
import { registerConfigRoutes } from "./routes/config.js";
import { registerDepinRoutes } from "./routes/depin.js";
import { registerEmsRoutes } from "./routes/ems.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerIotRoutes } from "./routes/iot.js";
import { registerMarketDataRoutes } from "./routes/market-data.js";
import { OperationsRealtimePublisher } from "./services/realtime.js";
import { createSupabaseAdmin } from "./services/supabase.js";

export function createBackendApp() {
  const config = loadBackendConfig();
  const prisma = getOperationsPrisma(config);
  const supabase = createSupabaseAdmin(config);
  const auth = new CompositeOperationsAuthAdapter([
    new InternalOperationsAuthAdapter(config),
    new SupabaseOperationsAuthAdapter(supabase),
  ]);
  const realtime = new OperationsRealtimePublisher(supabase, config);
  const app = express();
  const allowed = new Set(config.CORS_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean));

  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowed.has(origin)) return callback(null, true);
      return callback(new Error("CORS_ORIGIN_DENIED"));
    },
    credentials: true,
  }));
  app.use((_req, res, next) => { res.locals.requestId = randomUUID(); next(); });

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
    const candidate = error as { message?: string; code?: string; status?: number; details?: unknown };
    const corsDenied = candidate.message === "CORS_ORIGIN_DENIED";
    const status = corsDenied ? 403 : Number.isInteger(candidate.status) ? candidate.status! : 500;
    const code = corsDenied ? "CORS_ORIGIN_DENIED" : candidate.code ?? "INTERNAL_ERROR";
    const message = status >= 500 ? "Unexpected backend error" : candidate.message ?? code;
    res.status(status).json({ error: { code, message, requestId: res.locals.requestId, ...(candidate.details ? { details: candidate.details } : {}) } });
  });
  return { app, config, prisma };
}
