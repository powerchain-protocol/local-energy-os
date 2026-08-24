import type{EnergyMeasurement}from"@/types/proof-of-energy";
export function netExportWh(m:EnergyMeasurement){return Math.max(0,m.exportedWh-m.importedWh)}
export function measurementFingerprint(m:EnergyMeasurement){return [m.meterId,m.assetId,m.sequence,m.measuredAt,m.exportedWh].join(":")}
