import type { TelemetryFreshness } from "@powerchain/telemetry";

export type PowerUnit = "W" | "kW" | "MW";
export type EnergyUnit = "Wh" | "kWh" | "MWh";
export type DispatchKind = "SET_ACTIVE_POWER" | "CHARGE" | "DISCHARGE" | "CURTAIL" | "RELEASE";

export interface EmsSourceMeta {
  sourceId: string;
  observedAt: string;
  receivedAt: string;
  intervalMs: number;
  freshness: TelemetryFreshness;
  quality: "VALID" | "ESTIMATED" | "SUSPECT" | "MISSING";
}

export interface EmsPowerReading extends EmsSourceMeta {
  value: number;
  unit: PowerUnit;
}

export interface EmsEnergyReading extends EmsSourceMeta {
  value: bigint;
  unit: EnergyUnit;
}

export interface StorageState extends EmsSourceMeta {
  stateOfChargePct: number;
  activePower: number;
  activePowerUnit: PowerUnit;
  availableEnergyWh: bigint;
  temperatureC?: number;
  cycleState: "IDLE" | "CHARGING" | "DISCHARGING" | "FAULT" | "OFFLINE";
}

export interface GridState extends EmsSourceMeta {
  exchangePower: number;
  unit: PowerUnit;
  direction: "IMPORT" | "EXPORT" | "BALANCED";
  voltageKv?: number;
  frequencyHz?: number;
  importLimitMw?: number;
  exportLimitMw?: number;
  constraint?: string;
}

export interface EmsSnapshot {
  siteId: string;
  generatedAt: string;
  generation?: EmsPowerReading;
  demand?: EmsPowerReading;
  storage?: StorageState;
  grid?: GridState;
}

export interface ForecastPoint {
  startsAt: string;
  durationMinutes: number;
  generationMw?: number;
  demandMw?: number;
  confidence?: number;
}

export interface FlexibilityWindow {
  id: string;
  siteId: string;
  startsAt: string;
  endsAt: string;
  availableMw: number;
  direction: "UP" | "DOWN" | "BIDIRECTIONAL";
  confidence: number;
}

export interface DispatchIntent {
  id: string;
  siteId: string;
  assetId: string;
  kind: DispatchKind;
  targetMw?: number;
  durationSeconds?: number;
  requestedBy: string;
  requestedAt: string;
}

export interface DispatchSimulation {
  intentId: string;
  safe: boolean;
  simulatedAt: string;
  projectedGridMw?: number;
  projectedSocPct?: number;
  violations: string[];
}

export interface EmsProvider {
  readonly id: string;
  getSnapshot(siteId: string, signal?: AbortSignal): Promise<EmsSnapshot>;
  getForecast(siteId: string, horizonHours: number, signal?: AbortSignal): Promise<ForecastPoint[]>;
  getFlexibility(siteId: string, signal?: AbortSignal): Promise<FlexibilityWindow[]>;
  simulateDispatch(intent: DispatchIntent, signal?: AbortSignal): Promise<DispatchSimulation>;
}

export class EmsService {
  constructor(private readonly provider: EmsProvider) {}
  snapshot(siteId: string, signal?: AbortSignal) { return this.provider.getSnapshot(siteId, signal); }
  forecast(siteId: string, horizonHours = 24, signal?: AbortSignal) { return this.provider.getForecast(siteId, horizonHours, signal); }
  flexibility(siteId: string, signal?: AbortSignal) { return this.provider.getFlexibility(siteId, signal); }
  simulate(intent: DispatchIntent, signal?: AbortSignal) { return this.provider.simulateDispatch(intent, signal); }
  get providerId() { return this.provider.id; }
}

export interface EmsDispatchProvider {
  executeDispatch(intent: DispatchIntent, context: { approvalId?: string; idempotencyKey: string }, signal?: AbortSignal): Promise<{ dispatchId: string; submittedAt: string; providerReference?: string }>;
  verifyDispatch(dispatchId: string, signal?: AbortSignal): Promise<{ verified: boolean; observedAt: string; evidence: Record<string, unknown> }>;
}
