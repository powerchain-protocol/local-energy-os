import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";

export interface OnrampAdapterRequest {
  operation: string;
  payload?: Record<string, unknown>;
}
export interface OnrampAdapterResponse {
  provider: "onramp";
  operation: string;
  payload: Record<string, unknown>;
}

/** Onramp: fiat on-ramp quote and session creation. Never returns synthetic production data. */
export class OnrampAdapter implements IntegrationAdapter<
  OnrampAdapterRequest,
  OnrampAdapterResponse
> {
  readonly provider = "onramp";
  constructor(
    private readonly endpoint?: string,
    private readonly credentialReference?: string,
  ) {}
  async execute(
    request: OnrampAdapterRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<OnrampAdapterResponse>> {
    if (!this.endpoint)
      return {
        state: "misconfigured",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "INVALID_CONFIGURATION",
          message: "Onramp endpoint is not configured",
          retryable: false,
        },
      };
    if (!request.operation.trim())
      return {
        state: "unavailable",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "VALIDATION_FAILED",
          message: "Operation is required",
          retryable: false,
        },
      };
    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-request-id": context.requestId,
          ...(this.credentialReference
            ? { "x-credential-reference": this.credentialReference }
            : {}),
        },
        body: JSON.stringify(request),
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
            message: "Onramp request failed",
            retryable: response.status >= 429,
            providerStatus: response.status,
          },
        };
      const payload = (await response.json()) as Record<string, unknown>;
      return {
        state: "available",
        source: this.provider,
        observedAt: new Date().toISOString(),
        data: { provider: "onramp", operation: request.operation, payload },
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
      state: this.endpoint ? "available" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
