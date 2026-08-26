import type { Router } from "express";
import { publicBackendConfig, type BackendConfig } from "../config.js";
export function registerConfigRoutes(router: Router, config: BackendConfig) {
  router.get("/config", (_req, res) => res.json({ data: publicBackendConfig(config), meta: { generatedAt: new Date().toISOString() } }));
}
