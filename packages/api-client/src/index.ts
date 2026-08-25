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

export class PowerChainApiClient {
  constructor(private readonly baseUrl: string, private readonly context: () => Partial<RequestContext>) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<ApiSuccess<T>> {
    const headers = new Headers(contextHeaders(this.context()));
    for (const [key, value] of new Headers(init.headers)) headers.set(key, value);

    const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers });
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
