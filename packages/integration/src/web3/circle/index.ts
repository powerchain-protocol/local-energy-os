import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";

export type CircleOperation = "getBalances" | "createTransfer";
export interface CircleAdapterRequest {
  operation: CircleOperation;
  payload?: Record<string, unknown>;
}
export interface CircleAdapterResponse {
  provider: "circle";
  operation: CircleOperation;
  payload: unknown;
}

/** Circle: USDC wallet, transfer, and payment operations. Never returns synthetic production data. */
export class CircleAdapter implements IntegrationAdapter<
  CircleAdapterRequest,
  CircleAdapterResponse
> {
  readonly provider = "circle";
  constructor(
    private readonly endpoint = "https://api.circle.com",
    private readonly apiKey?: string,
  ) {}
  async execute(
    request: CircleAdapterRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<CircleAdapterResponse>> {
    if (!this.apiKey)
      return {
        state: "misconfigured",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "INVALID_CONFIGURATION",
          message: "Circle API key is not configured",
          retryable: false,
        },
      };
    if (request.operation !== "getBalances" && request.operation !== "createTransfer") {
      return {
        state: "unavailable",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: { code: "VALIDATION_FAILED", message: "Unsupported Circle operation", retryable: false },
      };
    }
    const route =
      request.operation === "getBalances"
        ? "/v1/businessAccount/balances"
        : "/v1/businessAccount/transfers";
    if (request.operation === "createTransfer" && !context.idempotencyKey)
      return {
        state: "unavailable",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "VALIDATION_FAILED",
          message: "Circle transfers require an idempotency key",
          retryable: false,
        },
      };
    try {
      const response = await fetch(`${this.endpoint}${route}`, {
        method: request.operation === "getBalances" ? "GET" : "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
          "x-request-id": context.requestId,
          ...(context.idempotencyKey
            ? { "idempotency-key": context.idempotencyKey }
            : {}),
        },
        body:
          request.operation === "createTransfer"
            ? JSON.stringify(request.payload ?? {})
            : undefined,
        signal: context.signal,
        cache: "no-store",
      });
      if (!response.ok)
        return {
          state: response.status === 429 ? "degraded" : "unavailable",
          source: this.provider,
          observedAt: new Date().toISOString(),
          error: {
            code:
              response.status === 429 ? "RATE_LIMITED" : "PROVIDER_UNAVAILABLE",
            message: "Circle request failed",
            retryable: response.status >= 429,
            providerStatus: response.status,
          },
        };
      const payload = (await response.json()) as Record<string, unknown>;
      return {
        state: "available",
        source: this.provider,
        observedAt: new Date().toISOString(),
        data: { provider: "circle", operation: request.operation, payload },
      };
    } catch (error) {
      return {
        state: context.signal.aborted ? "degraded" : "unavailable",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: context.signal.aborted ? "TIMEOUT" : "PROVIDER_UNAVAILABLE",
          message:
            error instanceof Error ? error.message : "Provider request failed",
          retryable: true,
        },
      };
    }
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.apiKey ? "available" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
