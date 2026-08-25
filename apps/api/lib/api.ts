import { ApiValidationError } from "@powerchain/validation";
import type { RequestContext } from "@powerchain/contracts";
import type { RuntimeConfig } from "@powerchain/config";
import type { RequestActor } from "./identity";
import { resolveContext } from "./context";
import { failure, success } from "./http";
import { resolveActor } from "./identity";
import { runtimeConfig } from "./runtime";

export interface ApiExecutionContext {
  context: RequestContext;
  runtime: RuntimeConfig;
  actor: RequestActor;
}

export async function readJson(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw Object.assign(new Error("Content-Type must be application/json"), { code: "UNSUPPORTED_MEDIA_TYPE", status: 415 });
  }
  try {
    return await req.json();
  } catch {
    throw new ApiValidationError("Request body must contain valid JSON");
  }
}

export function requireIdempotencyKey(req: Request): string {
  const key = req.headers.get("idempotency-key")?.trim();
  if (!key) throw Object.assign(new Error("Idempotency-Key header is required"), { code: "IDEMPOTENCY_KEY_REQUIRED", status: 428 });
  if (key.length > 128) throw new ApiValidationError("Idempotency-Key must be <= 128 characters", "Idempotency-Key");
  return key;
}

function errorDetails(error: unknown): { code: string; message: string; status: number; details?: Record<string, unknown> } {
  if (error instanceof ApiValidationError) return { code: error.code, message: error.message, status: error.status, details: error.field ? { field: error.field } : undefined };
  if (error && typeof error === "object") {
    const candidate = error as { code?: unknown; message?: unknown; status?: unknown; details?: unknown };
    return {
      code: typeof candidate.code === "string" ? candidate.code : "INTERNAL_ERROR",
      message: typeof candidate.message === "string" ? candidate.message : "Unexpected server error",
      status: typeof candidate.status === "number" ? candidate.status : 500,
      details: candidate.details && typeof candidate.details === "object" ? candidate.details as Record<string, unknown> : undefined,
    };
  }
  return { code: "INTERNAL_ERROR", message: "Unexpected server error", status: 500 };
}

export async function withApi<T>(req: Request, handler: (execution: ApiExecutionContext) => Promise<T> | T, options?: { status?: number }): Promise<Response> {
  const context = resolveContext(req);
  try {
    const runtime = runtimeConfig();
    const actor = await resolveActor(req, runtime, context.organizationId);
    if (actor.source === "SESSION" && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.headers.get("origin");
      const trusted = new Set((process.env.AUTH_TRUSTED_ORIGINS ?? process.env.POWERCHAIN_ORIGIN ?? "").split(",").map(item => item.trim()).filter(Boolean));
      if (!origin || !trusted.has(origin)) throw Object.assign(new Error("Unsafe request origin is not trusted"), { code: "CSRF_ORIGIN_REJECTED", status: 403 });
    }
    const data = await handler({ context, runtime, actor });
    const response = success(context, data, options?.status ?? 200);
    response.headers.set("x-powerchain-version", runtime.version);
    response.headers.set("x-powerchain-mode", runtime.operatingMode);
    response.headers.set("x-powerchain-data-mode", runtime.dataMode);
    response.headers.set("x-powerchain-network", runtime.network);
    return response;
  } catch (error) {
    const normalized = errorDetails(error);
    if (normalized.status >= 500) console.error(JSON.stringify({ service: "powerchain-api", requestId: context.requestId, correlationId: context.correlationId, code: normalized.code, message: normalized.message }));
    return failure(context, normalized.code, normalized.message, normalized.status, normalized.details);
  }
}
