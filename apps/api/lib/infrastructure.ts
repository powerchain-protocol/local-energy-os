import { getPrismaClient } from "@powerchain/database";

export function listPlants(organizationId: string) {
  return getPrismaClient().powerPlant.findMany({ where: { organizationId }, orderBy: { name: "asc" }, take: 100 });
}
export function listWindFarms(organizationId: string) {
  return getPrismaClient().windFarm.findMany({ where: { organizationId }, orderBy: { name: "asc" }, take: 100 });
}
export function listChargingStations(organizationId: string) {
  return getPrismaClient().chargingStation.findMany({ where: { organizationId }, orderBy: { name: "asc" }, take: 100 });
}
export function listChargingSessions(organizationId: string) {
  return getPrismaClient().chargingSession.findMany({ where: { station: { organizationId } }, include: { station: { select: { name: true, ocppIdentity: true } } }, orderBy: { startedAt: "desc" }, take: 100 });
}
export function listAssetPassports(organizationId: string) {
  return getPrismaClient().assetPassport.findMany({ where: { organizationId }, orderBy: { updatedAt: "desc" }, take: 100 });
}
export function listGridAreas() {
  return getPrismaClient().gridArea.findMany({ include: { substations: { include: { transformers: { include: { feeders: true } } } } }, orderBy: { code: "asc" }, take: 100 });
}
