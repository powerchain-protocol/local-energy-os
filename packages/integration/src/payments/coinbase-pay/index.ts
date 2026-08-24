import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";
import { providerFailure, providerJson } from "../http";

export interface CoinbasePayRequest {
  operation: "createSession";
  payload: Record<string, unknown>;
}
export interface CoinbasePayResponse {
  sessionToken?: string;
  url?: string;
  [key: string]: unknown;
}

export class CoinbasePayAdapter implements IntegrationAdapter<
  CoinbasePayRequest,
  CoinbasePayResponse
> {
  readonly provider = "coinbase-pay";
  constructor(
    private readonly apiKey?: string,
    private readonly baseUrl = "https://api.developer.coinbase.com/onramp/v1",
  ) {}
  async execute(
    request: CoinbasePayRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<CoinbasePayResponse>> {
    if (!this.apiKey)
      return providerFailure(
        this.provider,
        "Coinbase Pay API key is not configured",
        "INVALID_CONFIGURATION",
      );
    if (request.operation !== "createSession") return providerFailure(this.provider, "Unsupported Coinbase Pay operation");
    if (!Object.keys(request.payload).length)
      return providerFailure(
        this.provider,
        "Coinbase Pay session payload is required",
      );
    return providerJson(
      this.provider,
      `${this.baseUrl}/token`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          "content-type": "application/json",
          "x-request-id": context.requestId,
        },
        body: JSON.stringify(request.payload),
      },
      context,
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.apiKey ? "available" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
