import type {
  IntegrationAdapter,
  IntegrationContext,
} from "../../core/adapter";
import type { IntegrationHealth } from "../../core/health";
import type { IntegrationResult } from "../../core/result";
import { providerFailure } from "../http";

export interface SolanaPayRequest {
  operation: "createTransferUrl";
  payload: {
    recipient?: string;
    amount?: number | string;
    splToken?: string;
    reference?: string;
    label?: string;
    message?: string;
    memo?: string;
  };
}
export interface SolanaPayResponse {
  provider: "solana-pay";
  url: string;
}
const base58Address = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export class SolanaPayAdapter implements IntegrationAdapter<
  SolanaPayRequest,
  SolanaPayResponse
> {
  readonly provider = "solana-pay";
  async execute(
    request: SolanaPayRequest,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<SolanaPayResponse>> {
    if (request.operation !== "createTransferUrl") return providerFailure(this.provider, "Unsupported Solana Pay operation");
    const { recipient, amount, splToken, reference, label, message, memo } =
      request.payload;
    if (!recipient || !base58Address.test(recipient))
      return providerFailure(
        this.provider,
        "A valid Solana recipient address is required",
      );
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0)
      return providerFailure(
        this.provider,
        "A positive transfer amount is required",
      );
    if (splToken && !base58Address.test(splToken))
      return providerFailure(this.provider, "SPL token mint is invalid");
    if (reference && !base58Address.test(reference))
      return providerFailure(this.provider, "Reference address is invalid");
    const query = new URLSearchParams({ amount: String(amount) });
    if (splToken) query.set("spl-token", splToken);
    if (reference) query.append("reference", reference);
    if (label) query.set("label", label);
    if (message) query.set("message", message);
    if (memo) query.set("memo", memo);
    return {
      state: "available",
      source: this.provider,
      observedAt: new Date().toISOString(),
      data: { provider: this.provider, url: `solana:${recipient}?${query}` },
    };
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: "available",
      checkedAt: new Date().toISOString(),
    };
  }
}
