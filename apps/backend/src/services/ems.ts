import type { EmsPowerReading, EmsSnapshot, GridState, StorageState, EmsSourceMode } from "@powerchain/ems";
import type { PrismaClient } from "../generated/prisma/client.js";
import type { BackendConfig } from "../config.js";

type TelemetryRow = Awaited<ReturnType<PrismaClient["operationalTelemetry"]["findFirst"]>>;

function freshness(row: NonNullable<TelemetryRow>, thresholdMs: number): "FRESH" | "STALE" {
  const allowed = Math.max(thresholdMs, row.intervalMs * 2);
  return Date.now() - row.receivedAt.getTime() <= allowed ? "FRESH" : "STALE";
}
function mode(row: NonNullable<TelemetryRow>): EmsSourceMode {
  return (["LIVE","SIMULATED","ESTIMATED","MANUAL","UNCONFIGURED"] as const).includes(row.mode as EmsSourceMode) ? row.mode as EmsSourceMode : "UNCONFIGURED";
}
function meta(row: NonNullable<TelemetryRow>, thresholdMs: number) {
  return { sourceId: row.sourceId, observedAt: row.observedAt.toISOString(), receivedAt: row.receivedAt.toISOString(), intervalMs: row.intervalMs, mode: mode(row), freshness: freshness(row, thresholdMs), quality: (["VALID","ESTIMATED","SUSPECT","MISSING"] as const).includes(row.quality as any) ? row.quality as "VALID"|"ESTIMATED"|"SUSPECT"|"MISSING" : "SUSPECT" };
}

export class OperationsEmsService {
  constructor(private readonly prisma: PrismaClient, private readonly config: BackendConfig) {}
  private async latest(organizationId: string, siteId: string, metric: string) {
    return this.prisma.operationalTelemetry.findFirst({ where: { organizationId, siteId, metric }, orderBy: { observedAt: "desc" } });
  }
  async overview(organizationId: string, siteId: string): Promise<EmsSnapshot & { status: "LIVE" | "PARTIAL" | "UNCONFIGURED" }> {
    const [generation, demand, storagePower, storageSoc, storageEnergy, storageTemp, gridPower, gridVoltage, gridFrequency] = await Promise.all([
      this.latest(organizationId, siteId, "generation.active_power_kw"),
      this.latest(organizationId, siteId, "demand.active_power_kw"),
      this.latest(organizationId, siteId, "storage.active_power_kw"),
      this.latest(organizationId, siteId, "storage.soc_pct"),
      this.latest(organizationId, siteId, "storage.available_energy_wh"),
      this.latest(organizationId, siteId, "storage.temperature_c"),
      this.latest(organizationId, siteId, "grid.exchange_power_kw"),
      this.latest(organizationId, siteId, "grid.voltage_kv"),
      this.latest(organizationId, siteId, "grid.frequency_hz"),
    ]);
    const threshold = this.config.OPERATIONS_FRESHNESS_MS;
    const power = (row: NonNullable<TelemetryRow>): EmsPowerReading => ({ ...meta(row, threshold), value: Number(row.value), unit: "kW" });
    let storage: StorageState | undefined;
    if (storagePower && storageSoc && storageEnergy) storage = { ...meta(storagePower, threshold), stateOfChargePct: Number(storageSoc.value), activePower: Number(storagePower.value), activePowerUnit: "kW", availableEnergyWh: BigInt(storageEnergy.value.toFixed(0)), temperatureC: storageTemp ? Number(storageTemp.value) : undefined, cycleState: Number(storagePower.value) > 0 ? "DISCHARGING" : Number(storagePower.value) < 0 ? "CHARGING" : "IDLE" };
    let grid: GridState | undefined;
    if (gridPower) grid = { ...meta(gridPower, threshold), exchangePower: Number(gridPower.value), unit: "kW", direction: Number(gridPower.value) > 0 ? "IMPORT" : Number(gridPower.value) < 0 ? "EXPORT" : "BALANCED", voltageKv: gridVoltage ? Number(gridVoltage.value) : undefined, frequencyHz: gridFrequency ? Number(gridFrequency.value) : undefined };
    const count = [generation,demand,storage,grid].filter(Boolean).length;
    return { siteId, generatedAt: new Date().toISOString(), generation: generation ? power(generation) : undefined, demand: demand ? power(demand) : undefined, storage, grid, status: count === 0 ? "UNCONFIGURED" : count === 4 ? "LIVE" : "PARTIAL" };
  }
}
