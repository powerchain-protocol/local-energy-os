import type { TelemetryEnvelope } from "@powerchain/telemetry";

export type DeviceKind = "METER" | "INVERTER" | "BMS" | "PCS" | "EVSE" | "GATEWAY" | "SENSOR" | "CONTROLLER";
export type DeviceConnectionState = "ONLINE" | "DEGRADED" | "OFFLINE" | "UNCONFIGURED";

export interface IoTDevice {
  id: string;
  organizationId: string;
  siteId?: string;
  kind: DeviceKind;
  vendor?: string;
  model?: string;
  serialNumber?: string;
  connectionState: DeviceConnectionState;
  lastSeenAt?: string;
}

export interface DeviceCommand<T = unknown> {
  id: string;
  deviceId: string;
  name: string;
  payload: T;
  requestedAt: string;
  expiresAt: string;
  idempotencyKey: string;
}

export interface DeviceCommandResult {
  commandId: string;
  state: "ACCEPTED" | "REJECTED" | "EXECUTED" | "FAILED" | "EXPIRED";
  providerReference?: string;
  observedAt?: string;
  reason?: string;
}

export interface IoTProvider {
  readonly id: string;
  listDevices(organizationId: string, signal?: AbortSignal): Promise<IoTDevice[]>;
  readLatest<T>(deviceId: string, signal?: AbortSignal): Promise<TelemetryEnvelope<T> | null>;
  sendCommand<T>(command: DeviceCommand<T>, signal?: AbortSignal): Promise<DeviceCommandResult>;
}

export class IoTService {
  constructor(private readonly provider: IoTProvider) {}
  listDevices(organizationId: string, signal?: AbortSignal) { return this.provider.listDevices(organizationId, signal); }
  readLatest<T>(deviceId: string, signal?: AbortSignal) { return this.provider.readLatest<T>(deviceId, signal); }
  sendCommand<T>(command: DeviceCommand<T>, signal?: AbortSignal) { return this.provider.sendCommand(command, signal); }
  get providerId() { return this.provider.id; }
}
