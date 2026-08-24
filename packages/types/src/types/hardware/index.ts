export type HardwareStatus = "online" | "offline" | "maintenance" | "provisioning";
export type HardwareKind = "smart-meter" | "gateway" | "inverter" | "ev-charger" | "battery-controller" | "edge-node";

export interface HardwareDevice {
  id: string;
  name: string;
  kind: HardwareKind;
  manufacturer: string;
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  status: HardwareStatus;
  site: string;
  network: "ethernet" | "wifi" | "lte" | "lorawan" | "nbiot";
  lastSeenAt: string;
}

export interface FirmwareRelease {
  id: string;
  version: string;
  channel: "stable" | "beta" | "canary";
  targetKinds: HardwareKind[];
  releasedAt: string;
  rolloutPercent: number;
  signed: boolean;
}
