import type {
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { unavailable } from "../core";
export interface SuiTransactionCommand {
  operationId: string;
  transactionBytes: string;
  expectedSharedObjectVersions?: Record<string, string>;
}
export interface SuiTransactionEffects {
  digest: string;
  status: "success" | "failure";
  sharedObjectConflicts?: string[];
}
export class SuiIntegrationAdapter {
  readonly provider = "sui";
  constructor(private readonly rpcUrl?: string) {}
  async executeTransaction(
    _command: SuiTransactionCommand,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<SuiTransactionEffects>> {
    if (!this.rpcUrl)
      return unavailable(
        this.provider,
        "INVALID_CONFIGURATION",
        "Sui RPC URL is not configured",
      );
    return unavailable(
      this.provider,
      "PROVIDER_UNAVAILABLE",
      "Sui transaction was not executed because no signer was provided",
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.rpcUrl ? "degraded" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
