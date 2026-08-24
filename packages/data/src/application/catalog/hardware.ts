import type { FirmwareRelease, HardwareDevice } from "@/types/hardware";

export const hardwareDevices: HardwareDevice[] = [
  { id:"hw_meter_001", name:"North Campus Meter 01", kind:"smart-meter", manufacturer:"Landis+Gyr", model:"E360", serialNumber:"PC-MTR-001", firmwareVersion:"3.8.2", status:"online", site:"Helsinki Campus", network:"lte", lastSeenAt:"2026-07-31T18:20:00Z" },
  { id:"hw_gateway_001", name:"LoRaWAN Edge Gateway", kind:"gateway", manufacturer:"RAKwireless", model:"WisGate Edge", serialNumber:"PC-GW-001", firmwareVersion:"2.4.1", status:"online", site:"Espoo Microgrid", network:"lorawan", lastSeenAt:"2026-07-31T18:19:00Z" },
  { id:"hw_inv_001", name:"Solar Inverter A", kind:"inverter", manufacturer:"SMA", model:"Sunny Tripower", serialNumber:"PC-INV-001", firmwareVersion:"5.2.0", status:"maintenance", site:"Turku Solar Park", network:"ethernet", lastSeenAt:"2026-07-31T16:42:00Z" },
  { id:"hw_ev_001", name:"Fleet Charger 12", kind:"ev-charger", manufacturer:"ABB", model:"Terra 184", serialNumber:"PC-EV-012", firmwareVersion:"1.9.7", status:"online", site:"Tampere Logistics", network:"nbiot", lastSeenAt:"2026-07-31T18:18:00Z" },
];

export const firmwareReleases: FirmwareRelease[] = [
  { id:"fw_382", version:"3.8.2", channel:"stable", targetKinds:["smart-meter"], releasedAt:"2026-07-22", rolloutPercent:92, signed:true },
  { id:"fw_250", version:"2.5.0-beta.3", channel:"beta", targetKinds:["gateway","edge-node"], releasedAt:"2026-07-29", rolloutPercent:18, signed:true },
  { id:"fw_198", version:"1.9.8", channel:"stable", targetKinds:["ev-charger"], releasedAt:"2026-07-27", rolloutPercent:64, signed:true },
];
