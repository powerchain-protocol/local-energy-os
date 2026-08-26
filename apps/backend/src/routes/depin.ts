import type { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { OperationsAuthAdapter } from "@powerchain/adapters";
import { requireOperationsIdentity, operationsIdentity } from "../middleware/auth.js";
import { requireSiteAccess } from "../services/site-access.js";
import { listOperationalDepinNodes } from "../services/depin.js";
import { requiredQuery, operationalSuccess } from "./operational-utils.js";
export function registerDepinRoutes(router: Router, auth: OperationsAuthAdapter, prisma: PrismaClient) {
  router.get("/depin/nodes", requireOperationsIdentity(auth), async (req, res, next) => { try { const identity = operationsIdentity(res); const siteId = requiredQuery(req, "siteId"); await requireSiteAccess(prisma, identity, siteId, "read"); operationalSuccess(res, await listOperationalDepinNodes(prisma, identity.organizationId, siteId)); } catch (e) { next(e); } });
}
