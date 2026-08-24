import type {
  IntegrationAdapter,
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { unavailable } from "../core";
export interface HeliumHotspotQuery {
  latitude: number;
  longitude: number;
  radiusKm: number;
}
export interface HeliumHotspot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
}
export class HeliumAdapter implements IntegrationAdapter<
  HeliumHotspotQuery,
  HeliumHotspot[]
> {
  readonly provider = "helium";
  constructor(private readonly endpoint?: string) {}
  async execute(
    _request: HeliumHotspotQuery,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<HeliumHotspot[]>> {
    if (!this.endpoint)
      return unavailable(
        this.provider,
        "INVALID_CONFIGURATION",
        "Helium provider endpoint is not configured",
      );
    return unavailable(
      this.provider,
      "PROVIDER_UNAVAILABLE",
      "Helium discovery provider did not return a validated response",
      true,
    );
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.endpoint ? "unavailable" : "misconfigured",
      checkedAt: new Date().toISOString(),
      errorCode: this.endpoint
        ? "PROVIDER_UNAVAILABLE"
        : "INVALID_CONFIGURATION",
      circuitState: "closed",
    };
  }
}
