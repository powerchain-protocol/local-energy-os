import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";

export interface CetusAdapterRequest {
  operation: string;
  payload?: Record<string, unknown>;
}
export interface CetusAdapterResponse {
  provider: "cetus";
  operation: string;
  payload: Record<string, unknown>;
}

/** Cetus: Sui CLMM quote and swap construction. Never returns synthetic production data. */
export class CetusAdapter implements IntegrationAdapter<
  CetusAdapterRequest,
  CetusAdapterResponse
> {
  readonly provider = "cetus";
  constructor(
    private readonly endpoint?: string,
    private readonly credentialReference?: string,
  ) {}
  async execute(
    request: CetusAdapterRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<CetusAdapterResponse>> {
    if (!this.endpoint)
      return {
        state: "misconfigured",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "INVALID_CONFIGURATION",
          message: "Cetus endpoint is not configured",
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
            message: "Cetus request failed",
            retryable: response.status >= 429,
            providerStatus: response.status,
          },
        };
      const payload = (await response.json()) as Record<string, unknown>;
      return {
        state: "available",
        source: this.provider,
        observedAt: new Date().toISOString(),
        data: { provider: "cetus", operation: request.operation, payload },
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
