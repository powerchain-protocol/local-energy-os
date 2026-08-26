import type { OperationsIdentity } from "@powerchain/adapters";
import type { PrismaClient } from "../generated/prisma/client.js";

export async function requireSiteAccess(prisma: PrismaClient, identity: OperationsIdentity, siteId: string, permission: "read" | "prepare") {
  const access = await prisma.siteAccess.findUnique({ where: { actorId_organizationId_siteId: { actorId: identity.actorId, organizationId: identity.organizationId, siteId } } });
  const allowed = access?.active && (permission === "read" ? access.canRead : access.canPrepareActions);
  if (!allowed) throw Object.assign(new Error("Site access denied"), { code: "SITE_ACCESS_DENIED", status: 403, details: { siteId, permission } });
  return access;
}
