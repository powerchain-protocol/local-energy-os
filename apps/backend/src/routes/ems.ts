import type { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { OperationsAuthAdapter } from "@powerchain/adapters";
import type { BackendConfig } from "../config.js";
import { requireOperationsIdentity, operationsIdentity } from "../middleware/auth.js";
import { requireSiteAccess } from "../services/site-access.js";
import { OperationsEmsService } from "../services/ems.js";
import { requiredQuery, operationalSuccess } from "./operational-utils.js";
export function registerEmsRoutes(router: Router, auth: OperationsAuthAdapter, prisma: PrismaClient, config: BackendConfig) {
  const service = new OperationsEmsService(prisma, config);
  router.get("/ems/overview", requireOperationsIdentity(auth), async (req, res, next) => { try { const identity = operationsIdentity(res); const siteId = requiredQuery(req, "siteId"); await requireSiteAccess(prisma, identity, siteId, "read"); operationalSuccess(res, await service.overview(identity.organizationId, siteId)); } catch (e) { next(e); } });
}
