import type {
  IntegrationAdapter,
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { success, unavailable } from "../core";
export interface GatewayReception {
  gatewayId: string;
  rssi?: number;
  snr?: number;
}
export interface NormalizedLoraUplink {
  eventId: string;
  deviceEui: string;
  applicationId: string;
  frameCounter: number;
  port: number;
  payload: Uint8Array;
  decoded?: Record<string, unknown>;
  gateways: GatewayReception[];
  receivedAt: string;
}
export class LorawanAdapter implements IntegrationAdapter<
  NormalizedLoraUplink,
  NormalizedLoraUplink
> {
  readonly provider = "lorawan";
  private seen = new Set<string>();
  async execute(
    request: NormalizedLoraUplink,
    _context: IntegrationContext,
  ): Promise<IntegrationResult<NormalizedLoraUplink>> {
    const key = `${request.deviceEui}:${request.frameCounter}:${request.port}`;
    if (this.seen.has(key))
      return unavailable(
        this.provider,
        "CONFLICT",
        "Duplicate LoRaWAN uplink suppressed",
      );
    this.seen.add(key);
    return success(this.provider, {
      ...request,
      gateways: [
        ...new Map(request.gateways.map((g) => [g.gatewayId, g])).values(),
      ],
    });
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: "available",
      checkedAt: new Date().toISOString(),
      circuitState: "closed",
    };
  }
}
