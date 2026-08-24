import { createHelius, type HeliusClient } from "helius-sdk";
import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";

export type HeliusOperation =
  "getAsset" | "getAssetsByOwner" | "getPriorityFeeEstimate";
export interface HeliusAdapterRequest {
  operation: HeliusOperation;
  payload: Record<string, unknown>;
}
export interface HeliusAdapterResponse {
  provider: "helius";
  operation: HeliusOperation;
  payload: unknown;
}
export interface HeliusAdapterOptions {
  apiKey?: string;
  network?: "mainnet" | "devnet";
  baseUrl?: string;
}

function validationFailure(
  message: string,
): IntegrationResult<HeliusAdapterResponse> {
  return {
    state: "unavailable",
    source: "helius",
    observedAt: new Date().toISOString(),
    error: { code: "VALIDATION_FAILED", message, retryable: false },
  };
}

/** Helius SDK boundary for DAS assets and fee estimation. */
export class HeliusAdapter implements IntegrationAdapter<
  HeliusAdapterRequest,
  HeliusAdapterResponse
> {
  readonly provider = "helius";
  private readonly client?: HeliusClient;

  constructor(private readonly options: HeliusAdapterOptions = {}) {
    if (options.apiKey || options.baseUrl)
      this.client = createHelius({
        apiKey: options.apiKey,
        network: options.network ?? "mainnet",
        baseUrl: options.baseUrl,
        userAgent: "powerchain-integration/1.0.0",
      });
  }

  async execute(
    request: HeliusAdapterRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<HeliusAdapterResponse>> {
    if (!this.client)
      return {
        state: "misconfigured",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: "INVALID_CONFIGURATION",
          message: "Helius API key or base URL is not configured",
          retryable: false,
        },
      };
    if (context.signal.aborted)
      return validationFailure("Helius request was cancelled");
    try {
      let payload: unknown;
      switch (request.operation) {
        case "getAsset": {
          const id =
            typeof request.payload.id === "string"
              ? request.payload.id.trim()
              : "";
          if (!id) return validationFailure("A Solana asset id is required");
          payload = await this.client.getAsset({ id });
          break;
        }
        case "getAssetsByOwner": {
          const ownerAddress =
            typeof request.payload.ownerAddress === "string"
              ? request.payload.ownerAddress.trim()
              : "";
          if (!ownerAddress)
            return validationFailure("A Solana owner address is required");
          const limit =
            typeof request.payload.limit === "number"
              ? Math.min(Math.max(Math.trunc(request.payload.limit), 1), 1000)
              : 100;
          payload = await this.client.getAssetsByOwner({ ownerAddress, limit });
          break;
        }
        case "getPriorityFeeEstimate": {
          const accountKeys = Array.isArray(request.payload.accountKeys)
            ? request.payload.accountKeys.filter(
                (value): value is string =>
                  typeof value === "string" && value.length > 0,
              )
            : undefined;
          const transaction =
            typeof request.payload.transaction === "string"
              ? request.payload.transaction
              : undefined;
          if (!transaction && !accountKeys?.length)
            return validationFailure(
              "A transaction or accountKeys list is required",
            );
          payload = await this.client.getPriorityFeeEstimate({
            transaction,
            accountKeys,
          });
          break;
        }
        default:
          return validationFailure("Unsupported Helius operation");
      }
      if (context.signal.aborted)
        throw new DOMException("Request timed out", "AbortError");
      return {
        state: "available",
        source: this.provider,
        observedAt: new Date().toISOString(),
        data: { provider: "helius", operation: request.operation, payload },
      };
    } catch (error) {
      const timedOut =
        context.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError");
      return {
        state: timedOut ? "degraded" : "unavailable",
        source: this.provider,
        observedAt: new Date().toISOString(),
        error: {
          code: timedOut ? "TIMEOUT" : "PROVIDER_UNAVAILABLE",
          message: timedOut
            ? "Helius request timed out"
            : error instanceof Error
              ? error.message
              : "Helius request failed",
          retryable: true,
        },
      };
    }
  }

  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.client ? "available" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
