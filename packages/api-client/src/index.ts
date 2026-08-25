import type { ApiErrorPayload, ApiFailure, ApiSuccess, RequestContext } from "@powerchain/contracts";

export function contextHeaders(ctx: Partial<RequestContext>): HeadersInit {
  const headers: Record<string, string> = {};
  if (ctx.requestId) headers["x-request-id"] = ctx.requestId;
  if (ctx.correlationId) headers["x-correlation-id"] = ctx.correlationId;
  if (ctx.organizationId) headers["x-organization-id"] = ctx.organizationId;
  if (ctx.tenantId) headers["x-tenant-id"] = ctx.tenantId;
  if (ctx.workspaceId) headers["x-workspace-id"] = ctx.workspaceId;
  if (ctx.contextType) headers["x-powerchain-context"] = ctx.contextType;
  return headers;
}

export function resolveApiBaseUrl(configured: string | undefined, environment: string | undefined): string {
  const value = configured?.trim();
  if (value) return value.replace(/\/$/, "");
  if (environment === "production") {
    throw new Error("NEXT_PUBLIC_API_URL is required in production PowerChain web applications.");
  }
  return "http://localhost:3002";
}

export class PowerChainApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly requestId?: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PowerChainApiError";
  }
}

export interface MutationOptions { idempotencyKey: string; signal?: AbortSignal }
export interface PowerChainApiClientOptions { timeoutMs?: number }

async function readResponseBody<T>(response: Response): Promise<ApiSuccess<T> | ApiFailure | undefined> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return undefined;
  try {
    return await response.json() as ApiSuccess<T> | ApiFailure;
  } catch {
    return undefined;
  }
}

function fallbackError(response: Response): ApiErrorPayload {
  return {
    code: `HTTP_${response.status}`,
    message: response.statusText || "PowerChain API request failed",
    requestId: response.headers.get("x-request-id") ?? undefined,
    details: undefined,
  };
}

function requestSignal(external: AbortSignal | null | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const abort = () => controller.abort();
  if (external) {
    if (external.aborted) controller.abort();
    else external.addEventListener("abort", abort, { once: true });
  }
  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup() {
      clearTimeout(timer);
      external?.removeEventListener("abort", abort);
    },
  };
}

export class PowerChainApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl: string, private readonly context: () => Partial<RequestContext>, options: PowerChainApiClientOptions = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
    const headers = new Headers(contextHeaders(this.context()));
    for (const [key, value] of new Headers(init.headers)) headers.set(key, value);
    const controlled = requestSignal(init.signal, this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { ...init, headers, signal: controlled.signal });
    } catch (cause) {
      if (init.signal?.aborted) throw cause;
      if (controlled.timedOut()) {
        throw new PowerChainApiError(0, "REQUEST_TIMEOUT", `PowerChain API did not respond within ${this.timeoutMs} ms.`);
      }
      throw new PowerChainApiError(0, "NETWORK_ERROR", cause instanceof Error ? cause.message : "PowerChain API is unreachable.");
    } finally {
      controlled.cleanup();
    }

    const body = await readResponseBody<T>(response);
    if (!response.ok || !body || "error" in body) {
      const error: ApiErrorPayload = body && "error" in body ? body.error : fallbackError(response);
      throw new PowerChainApiError(response.status, error.code, error.message, error.requestId, error.details);
    }
    return body;
  }

  async get<T>(path: string, signal?: AbortSignal): Promise<ApiSuccess<T>> {
    return this.request<T>(path, { method: "GET", signal });
  }

  async post<TResponse, TBody extends object>(path: string, body: TBody, options: MutationOptions): Promise<ApiSuccess<TResponse>> {
    return this.request<TResponse>(path, {
      method: "POST",
      signal: options.signal,
      headers: { "content-type": "application/json", "idempotency-key": options.idempotencyKey },
      body: JSON.stringify(body),
    });
  }
}
