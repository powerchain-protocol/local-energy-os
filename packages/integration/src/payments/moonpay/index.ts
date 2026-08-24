import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";
import { providerFailure, providerJson } from "../http";

export interface MoonPayRequest {
  operation: "getBuyQuote";
  payload: {
    baseCurrencyCode?: string;
    quoteCurrencyCode?: string;
    baseCurrencyAmount?: number;
  };
}
export interface MoonPayResponse {
  quoteCurrencyAmount?: number;
  baseCurrencyAmount?: number;
  feeAmount?: number;
  [key: string]: unknown;
}

export class MoonPayAdapter implements IntegrationAdapter<
  MoonPayRequest,
  MoonPayResponse
> {
  readonly provider = "moonpay";
  constructor(
    private readonly apiKey?: string,
    private readonly baseUrl = "https://api.moonpay.com",
  ) {}
  async execute(
    request: MoonPayRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<MoonPayResponse>> {
    if (!this.apiKey)
      return providerFailure(
        this.provider,
        "MoonPay API key is not configured",
        "INVALID_CONFIGURATION",
      );
    if (request.operation !== "getBuyQuote") return providerFailure(this.provider, "Unsupported MoonPay operation");
    const { baseCurrencyCode, quoteCurrencyCode, baseCurrencyAmount } =
      request.payload;
    if (
      !baseCurrencyCode ||
      !quoteCurrencyCode ||
      !baseCurrencyAmount ||
      baseCurrencyAmount <= 0
    )
      return providerFailure(
        this.provider,
        "Valid base currency, quote currency, and amount are required",
      );
    const query = new URLSearchParams({
      apiKey: this.apiKey,
      baseCurrencyCode,
      quoteCurrencyCode,
      baseCurrencyAmount: String(baseCurrencyAmount),
    });
    return providerJson(
      this.provider,
      `${this.baseUrl}/v3/currencies/${encodeURIComponent(quoteCurrencyCode)}/buy_quote?${query}`,
      { headers: { "x-request-id": context.requestId } },
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
