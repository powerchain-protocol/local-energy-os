import { preparedActionPolicy, type PreparedActionKind } from "@powerchain/safe-actions";
import type { OperationsIdentity } from "@powerchain/adapters";
import type { PrismaClient } from "../generated/prisma/client.js";
import { requireSiteAccess } from "./site-access.js";
import type { OperationsRealtimePublisher } from "./realtime.js";

export async function prepareOperationalAction(input: { prisma: PrismaClient; identity: OperationsIdentity; kind: PreparedActionKind; siteId?: string; idempotencyKey: string; request: Record<string, unknown>; realtime: OperationsRealtimePublisher }) {
  const policy = preparedActionPolicy(input.kind);
  const siteScoped = new Set(["ems.dispatch.prepare", "iot.device.refresh", "depin.node.refresh"]);
  if (siteScoped.has(input.kind) && !input.siteId) throw Object.assign(new Error("siteId is required for this action"), { code: "SITE_ID_REQUIRED", status: 400 });
  if (input.siteId) await requireSiteAccess(input.prisma, input.identity, input.siteId, policy.disposition === "READ_ONLY" ? "read" : "prepare");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const existing = await input.prisma.safeActionIntent.findUnique({ where: { organizationId_idempotencyKey: { organizationId: input.identity.organizationId, idempotencyKey: input.idempotencyKey } } });
  if (existing) return existing;
  const created = await input.prisma.safeActionIntent.create({ data: {
    organizationId: input.identity.organizationId,
    siteId: input.siteId,
    actorId: input.identity.actorId,
    kind: policy.kind,
    disposition: policy.disposition,
    idempotencyKey: input.idempotencyKey,
    request: input.request,
    requiresReview: policy.disposition === "REVIEW_REQUIRED",
    requiresWalletSignature: policy.disposition === "WALLET_SIGNATURE_REQUIRED",
    expiresAt,
  } });
  await input.realtime.publish("safe-action.prepared", { intentId: created.id, organizationId: created.organizationId, siteId: created.siteId, kind: created.kind, disposition: created.disposition });
  return created;
}
