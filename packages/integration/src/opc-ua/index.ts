import type { IntegrationHealth, IntegrationResult } from "../core";
import { unavailable } from "../core";
export interface OpcUaReading {
  nodeId: string;
  value: unknown;
  sourceTimestamp: string;
  qualityCode: string;
  sequence?: number;
}
export class OpcUaAdapter {
  readonly provider = "opc-ua";
  constructor(private readonly protectedConnectorUrl?: string) {}
  async read(_nodeIds: string[]): Promise<IntegrationResult<OpcUaReading[]>> {
    if (!this.protectedConnectorUrl)
      return unavailable(
        this.provider,
        "INVALID_CONFIGURATION",
        "Protected OPC UA connector is not configured",
      );
    return unavailable(
      this.provider,
      "PROVIDER_UNAVAILABLE",
      "No validated OPC UA connector response",
      true,
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.protectedConnectorUrl ? "unavailable" : "misconfigured",
      checkedAt: new Date().toISOString(),
    };
  }
}
