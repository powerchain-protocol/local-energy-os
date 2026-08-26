import type { ApiExecutionContext } from "./api";
import { requireOrganization } from "./context";

function backendBase() {
  const configured = process.env.OPERATIONS_BACKEND_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if ((process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development") === "production") throw Object.assign(new Error("Operations backend is not configured"), { code: "OPERATIONS_BACKEND_UNCONFIGURED", status: 503 });
  return "http://127.0.0.1:8000/api/v1";
}

export async function proxyOperations(req: Request, execution: ApiExecutionContext, path: string): Promise<unknown> {
  const organizationId = requireOrganization(execution.context);
  if (!execution.actor.id) throw Object.assign(new Error("Authenticated user is required"), { code: "AUTH_REQUIRED", status: 401 });
  const target = new URL(`${backendBase()}${path}`);
  const source = new URL(req.url);
  source.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const internalToken = process.env.OPERATIONS_INTERNAL_BEARER_TOKEN?.trim();
  if (!internalToken && execution.runtime.environment === "production") throw Object.assign(new Error("Operations internal bearer token is not configured"), { code: "OPERATIONS_AUTH_UNCONFIGURED", status: 503 });
  const headers = new Headers({
    "accept": "application/json",
    "x-request-id": execution.context.requestId,
    "x-correlation-id": execution.context.correlationId,
    "x-powerchain-user-id": execution.actor.id,
    "x-powerchain-organization-id": organizationId,
    "x-powerchain-role": execution.actor.role ?? "VIEWER",
  });
  if (internalToken) headers.set("authorization", `Bearer ${internalToken}`);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const idempotency = req.headers.get("idempotency-key");
  if (idempotency) headers.set("idempotency-key", idempotency);
  const body = ["GET","HEAD"].includes(req.method) ? undefined : await req.text();
  const response = await fetch(target, { method: req.method, headers, body, signal: req.signal });
  const payload = await response.json().catch(() => null) as any;
  if (!response.ok) {
    const error = payload?.error ?? {};
    throw Object.assign(new Error(error.message ?? `Operations backend returned HTTP ${response.status}`), { code: error.code ?? "OPERATIONS_BACKEND_ERROR", status: response.status, details: error.details });
  }
  return payload?.data ?? payload;
}
