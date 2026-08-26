import type { DePinNode, DePinNodeState } from "@powerchain/depin";
import type { PrismaClient } from "../generated/prisma/client.js";
const STATES = new Set<DePinNodeState>(["ACTIVE","DEGRADED","OFFLINE","QUARANTINED","UNVERIFIED"]);
export async function listOperationalDepinNodes(prisma: PrismaClient, organizationId: string, siteId: string): Promise<DePinNode[]> {
  const rows = await prisma.depinNode.findMany({ where: { organizationId, siteId }, orderBy: { id: "asc" } });
  return rows.map(row => ({ id: row.id, network: row.network, operatorId: row.operatorId, locationRef: row.locationRef ?? undefined, capabilities: Array.isArray(row.capabilities) ? row.capabilities.filter((v): v is string => typeof v === "string") : [], state: STATES.has(row.state as DePinNodeState) ? row.state as DePinNodeState : "UNVERIFIED", freshness: !row.lastSeenAt ? "UNCONFIGURED" : Date.now() - row.lastSeenAt.getTime() < 30000 ? "FRESH" : "STALE", lastSeenAt: row.lastSeenAt?.toISOString() }));
}
