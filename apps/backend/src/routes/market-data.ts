import type { Router } from "express";
import type { OperationsAuthAdapter } from "@powerchain/adapters";
import type { BackendConfig } from "../config.js";
import { requireOperationsIdentity } from "../middleware/auth.js";
import { getMarketPrices } from "../services/market-data.js";
import { operationalSuccess } from "./operational-utils.js";
export function registerMarketDataRoutes(router: Router, auth: OperationsAuthAdapter, config: BackendConfig) {
  router.get("/market-data/prices", requireOperationsIdentity(auth), async (req, res, next) => { try { const raw = typeof req.query.symbols === "string" ? req.query.symbols : ""; const symbols = [...new Set(raw.split(",").map(v => v.trim().toUpperCase()).filter(Boolean))].slice(0, 20); if (!symbols.length) throw Object.assign(new Error("symbols is required"), { code: "INVALID_REQUEST", status: 400 }); operationalSuccess(res, await getMarketPrices(config, symbols)); } catch (e) { next(e); } });
}
