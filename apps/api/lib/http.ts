import { randomUUID } from "node:crypto";
import type { ApiFailure, ApiSuccess, RequestContext } from "@powerchain/contracts";

export function requestId(req: Request): string {
  return req.headers.get("x-request-id") ?? randomUUID();
}

function jsonSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(jsonSafe);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, jsonSafe(item)]));
  }
  return value;
}

export function success<T>(context: RequestContext, data: T, status = 200): Response {
  const body: ApiSuccess<unknown> = {
    data: jsonSafe(data),
    meta: { requestId: context.requestId, generatedAt: new Date().toISOString() },
  };
  return Response.json(body, {
    status,
    headers: {
      "x-request-id": context.requestId,
      "x-correlation-id": context.correlationId,
      "cache-control": "no-store",
    },
  });
}

export function failure(context: RequestContext, code: string, message: string, status = 400, details?: Record<string, unknown>): Response {
  const body: ApiFailure = { error: { code, message, requestId: context.requestId, details } };
  return Response.json(jsonSafe(body), {
    status,
    headers: {
      "x-request-id": context.requestId,
      "x-correlation-id": context.correlationId,
      "cache-control": "no-store",
    },
  });
}

// Compatibility helpers for simple/public routes. New domain routes should use withApi().
export function ok<T>(req: Request, data: T, status = 200): Response {
  const id = requestId(req);
  return success({ requestId: id, correlationId: req.headers.get("x-correlation-id") ?? id }, data, status);
}

export function fail(req: Request, code: string, message: string, status = 400, details?: Record<string, unknown>): Response {
  const id = requestId(req);
  return failure({ requestId: id, correlationId: req.headers.get("x-correlation-id") ?? id }, code, message, status, details);
}
