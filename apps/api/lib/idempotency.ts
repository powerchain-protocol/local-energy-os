import { createHash } from "node:crypto";
import type { RequestContext } from "@powerchain/contracts";
import { getPrismaClient } from "@powerchain/database";

function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, jsonSafe(v)]));
  return value;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(jsonSafe(value));
}

export function requestHash(body: unknown): string {
  return createHash("sha256").update(canonical(body)).digest("hex");
}

function replay(existing: { requestHash: string; state: string; responseBody: unknown }, hash: string) {
  if (existing.requestHash !== hash) throw Object.assign(new Error("Idempotency-Key was already used with a different request payload"), { code: "IDEMPOTENCY_KEY_REUSED", status: 409 });
  if (existing.state === "COMPLETED") return { value: existing.responseBody, replayed: true } as const;
  throw Object.assign(new Error("A request with this Idempotency-Key is already in progress"), { code: "IDEMPOTENCY_IN_PROGRESS", status: 409 });
}

export async function executeIdempotent<T>(input: {
  context: RequestContext;
  key: string;
  method: string;
  path: string;
  body: unknown;
  execute: () => Promise<T>;
}): Promise<{ value: T | unknown; replayed: boolean }> {
  const organizationId = input.context.organizationId;
  if (!organizationId) throw Object.assign(new Error("Organization context is required"), { code: "ORGANIZATION_CONTEXT_REQUIRED", status: 401 });
  const prisma = getPrismaClient();
  const hash = requestHash(input.body);
  const identity = { organizationId, key: input.key, method: input.method, path: input.path };
  const now = new Date();

  const existing = await prisma.idempotencyRecord.findUnique({ where: { organizationId_key_method_path: identity } });
  if (existing && existing.expiresAt > now) return replay(existing, hash);
  if (existing) await prisma.idempotencyRecord.delete({ where: { id: existing.id } });

  let reservation;
  try {
    reservation = await prisma.idempotencyRecord.create({
      data: {
        ...identity,
        requestHash: hash,
        state: "IN_PROGRESS",
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  } catch {
    const raced = await prisma.idempotencyRecord.findUnique({ where: { organizationId_key_method_path: identity } });
    if (raced) return replay(raced, hash);
    throw Object.assign(new Error("Unable to reserve idempotency key"), { code: "IDEMPOTENCY_RESERVATION_FAILED", status: 503 });
  }

  let executed = false;
  try {
    const value = await input.execute();
    executed = true;
    const responseBody = jsonSafe(value) as any;
    try {
      await prisma.idempotencyRecord.update({
        where: { id: reservation.id },
        data: { state: "COMPLETED", responseStatus: 200, responseBody },
      });
    } catch {
      // The economic transaction may already be committed. Keep IN_PROGRESS so a retry
      // cannot duplicate execution; operator reconciliation can complete/expire the record.
      throw Object.assign(new Error("Economic mutation completed but idempotency finalization is pending"), { code: "IDEMPOTENCY_FINALIZATION_PENDING", status: 503 });
    }
    return { value, replayed: false };
  } catch (error) {
    if (!executed) {
      // No economic transaction committed; release the reservation for a safe retry.
      await prisma.idempotencyRecord.deleteMany({ where: { id: reservation.id, state: "IN_PROGRESS" } }).catch(() => undefined);
    }
    throw error;
  }
}
