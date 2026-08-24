import type {
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { unavailable } from "../core";
export interface SolanaSettlementCommand {
  operationId: string;
  reference: string;
  transactionBase64: string;
  commitment?: "processed" | "confirmed" | "finalized";
}
export interface SolanaConfirmation {
  signature: string;
  commitment: string;
  slot?: number;
}
export class SolanaIntegrationAdapter {
  readonly provider = "solana";
  constructor(private readonly rpcUrl?: string) {}
  async submitSettlement(
    _command: SolanaSettlementCommand,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<SolanaConfirmation>> {
    if (!this.rpcUrl)
      return unavailable(
        this.provider,
        "INVALID_CONFIGURATION",
        "Solana RPC URL is not configured",
      );
    return unavailable(
      this.provider,
      "PROVIDER_UNAVAILABLE",
      "Solana transaction was not submitted because no authorized signer was provided",
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.rpcUrl ? "degraded" : "misconfigured",
      checkedAt: new Date().toISOString(),
      errorCode: this.rpcUrl ? "AUTHORIZATION_FAILED" : "INVALID_CONFIGURATION",
    };
  }
}
