import type { Router } from "express";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { OperationsAuthAdapter } from "@powerchain/adapters";
import { requireOperationsIdentity, operationsIdentity } from "../middleware/auth.js";
import { requireSiteAccess } from "../services/site-access.js";
import { listOperationalDevices } from "../services/iot.js";
import { requiredQuery, operationalSuccess } from "./operational-utils.js";
export function registerIotRoutes(router: Router, auth: OperationsAuthAdapter, prisma: PrismaClient) {
  router.get("/iot/devices", requireOperationsIdentity(auth), async (req, res, next) => { try { const identity = operationsIdentity(res); const siteId = requiredQuery(req, "siteId"); await requireSiteAccess(prisma, identity, siteId, "read"); operationalSuccess(res, await listOperationalDevices(prisma, identity.organizationId, siteId)); } catch (e) { next(e); } });
}
