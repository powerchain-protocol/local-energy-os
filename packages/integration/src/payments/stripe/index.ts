import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";
import { appendFormValue, providerFailure, providerJson } from "../http";

export interface StripeCheckoutRequest {
  operation: "createCheckoutSession";
  payload: Record<string, unknown>;
}
export interface StripeCheckoutResponse {
  id: string;
  object: string;
  url?: string | null;
  status?: string;
}

export class StripeAdapter implements IntegrationAdapter<
  StripeCheckoutRequest,
  StripeCheckoutResponse
> {
  readonly provider = "stripe";
  constructor(
    private readonly secretKey?: string,
    private readonly baseUrl = "https://api.stripe.com/v1",
  ) {}
  async execute(
    request: StripeCheckoutRequest,
    context: IntegrationContext,
  ): Promise<IntegrationResult<StripeCheckoutResponse>> {
    if (!this.secretKey)
      return providerFailure(
        this.provider,
        "Stripe secret key is not configured",
        "INVALID_CONFIGURATION",
      );
    if (request.operation !== "createCheckoutSession")
      return providerFailure(this.provider, "Unsupported Stripe operation");
    const form = new URLSearchParams();
    Object.entries(request.payload).forEach(([key, value]) =>
      appendFormValue(form, key, value),
    );
    if (
      !form.has("mode") ||
      !form.has("success_url") ||
      !form.has("cancel_url")
    )
      return providerFailure(
        this.provider,
        "mode, success_url, and cancel_url are required",
      );
    return providerJson(
      this.provider,
      `${this.baseUrl}/checkout/sessions`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${this.secretKey}`,
          "content-type": "application/x-www-form-urlencoded",
          "idempotency-key": context.idempotencyKey ?? context.requestId,
        },
        body: form,
      },
      context,
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.secretKey ? "available" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
