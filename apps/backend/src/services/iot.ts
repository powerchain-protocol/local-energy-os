import type { IoTDevice, DeviceKind, DeviceConnectionState } from "@powerchain/iot";
import type { PrismaClient } from "../generated/prisma/client.js";
const KINDS = new Set<DeviceKind>(["METER","INVERTER","BMS","PCS","EVSE","GATEWAY","SENSOR","CONTROLLER"]);
const STATES = new Set<DeviceConnectionState>(["ONLINE","DEGRADED","OFFLINE","UNCONFIGURED"]);
export async function listOperationalDevices(prisma: PrismaClient, organizationId: string, siteId: string): Promise<IoTDevice[]> {
  const rows = await prisma.operationalDevice.findMany({ where: { organizationId, siteId }, orderBy: [{ kind: "asc" }, { id: "asc" }] });
  return rows.map(row => ({ id: row.id, organizationId: row.organizationId, siteId: row.siteId, kind: KINDS.has(row.kind as DeviceKind) ? row.kind as DeviceKind : "SENSOR", vendor: row.vendor ?? undefined, model: row.model ?? undefined, serialNumber: row.serialNumber ?? undefined, connectionState: STATES.has(row.connectionState as DeviceConnectionState) ? row.connectionState as DeviceConnectionState : "UNCONFIGURED", lastSeenAt: row.lastSeenAt?.toISOString() }));
}
