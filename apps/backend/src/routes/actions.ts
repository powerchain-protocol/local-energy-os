import type { Router } from "express";
import type { OperationsAuthAdapter } from "@powerchain/adapters";
import type { PrismaClient } from "../generated/prisma/client.js";
import { requireOperationsIdentity, operationsIdentity } from "../middleware/auth.js";
import { prepareOperationalAction } from "../services/safe-action.js";
import type { OperationsRealtimePublisher } from "../services/realtime.js";
import { operationalSuccess } from "./operational-utils.js";
export function registerActionRoutes(router: Router, auth: OperationsAuthAdapter, prisma: PrismaClient, realtime: OperationsRealtimePublisher) {
  router.post("/actions/prepare", requireOperationsIdentity(auth), async (req, res, next) => { try {
    const identity = operationsIdentity(res);
    const idempotencyKey = req.header("idempotency-key")?.trim();
    if (!idempotencyKey || idempotencyKey.length > 128) throw Object.assign(new Error("Valid Idempotency-Key header is required"), { code: "IDEMPOTENCY_KEY_REQUIRED", status: 428 });
    const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
    const kind = String(body.kind ?? "");
    const siteId = typeof body.siteId === "string" && body.siteId.trim() ? body.siteId.trim() : undefined;
    const request = body.request && typeof body.request === "object" && !Array.isArray(body.request) ? body.request as Record<string, unknown> : {};
    const intent = await prepareOperationalAction({ prisma, identity, kind, siteId, idempotencyKey, request, realtime });
    operationalSuccess(res, { id: intent.id, kind: intent.kind, state: intent.state, disposition: intent.disposition, siteId: intent.siteId, requiresReview: intent.requiresReview, requiresWalletSignature: intent.requiresWalletSignature, expiresAt: intent.expiresAt.toISOString(), executionEndpointAvailable: false }, 201);
  } catch (e) { next(e); } });
}
