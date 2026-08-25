export type MeterStatus = "REGISTERED"|"CLAIMED"|"PROVISIONING"|"ACTIVE"|"DEGRADED"|"OFFLINE"|"SUSPENDED"|"RETIRED";
export interface EnergyIntervalReading { importWh: bigint; exportWh: bigint; generationWh: bigint; consumptionWh: bigint; intervalStart: string; intervalEnd: string }
export interface PlausibilityLimits { installedGenerationW?: bigint; exportCapacityW?: bigint; intervalSeconds: number }
export function validateEnergyPlausibility(reading: EnergyIntervalReading, limits: PlausibilityLimits): string[] {
  const issues: string[] = [];
  for (const [field,value] of Object.entries(reading)) if (typeof value === "bigint" && value < 0n) issues.push(`${field}:NEGATIVE`);
  if (limits.installedGenerationW != null) {
    const maximumWh = limits.installedGenerationW * BigInt(limits.intervalSeconds) / 3600n;
    if (reading.generationWh > maximumWh * 105n / 100n) issues.push("GENERATION_EXCEEDS_CAPACITY");
  }
  if (limits.exportCapacityW != null) {
    const maximumWh = limits.exportCapacityW * BigInt(limits.intervalSeconds) / 3600n;
    if (reading.exportWh > maximumWh * 105n / 100n) issues.push("EXPORT_EXCEEDS_CONNECTION_CAPACITY");
  }
  return issues;
}
