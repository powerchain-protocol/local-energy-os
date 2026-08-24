export const ENERGY_CORE_VERSION = "1.0.0" as const;
export type EnergyWh = bigint;
export const WH = 1n;
export const KWH = 1_000n;
export const MWH = 1_000_000n;
export const GWH = 1_000_000_000n;

export type EnergySource = "SOLAR" | "WIND" | "HYDRO" | "BIOMASS" | "GRID" | "STORAGE_DISCHARGE";
export type EnergyProofState = "PENDING" | "VERIFIED" | "REJECTED" | "INVALIDATED";
export type EnergyBatchState = "OPEN" | "FINALIZED" | "INVALIDATED";
export type EnergyPositionState = "AVAILABLE" | "RESERVED" | "COMMITTED" | "DELIVERING" | "DELIVERED" | "SETTLING" | "SETTLED" | "RETIRED" | "RELEASED" | "TRANSFERRED" | "DISPUTED" | "RECONCILED";
export type EnergyRetirementReason = "CONSUMED" | "SETTLED" | "CERTIFIED" | "INVALIDATED" | "CANCELLED" | "MIGRATED";

export interface EnergyProof {
  id: string;
  organizationId: string;
  siteId: string;
  meterId: string;
  meteringPointId?: string;
  source: EnergySource;
  measuredWh: EnergyWh;
  verifiedWh: EnergyWh;
  intervalStart: Date;
  intervalEnd: Date;
  qualityScorePpm: bigint;
  evidenceRoot: string;
  verifier: string;
  verificationVersion: string;
  state: EnergyProofState;
}

export interface EnergyBatch {
  id: string;
  organizationId: string;
  siteId: string;
  gridAreaId?: string;
  source: EnergySource;
  intervalStart: Date;
  intervalEnd: Date;
  measuredWh: EnergyWh;
  verifiedWh: EnergyWh;
  invalidatedWh: EnergyWh;
  retiredWh: EnergyWh;
  state: EnergyBatchState;
  evidenceRoot: string;
  proofIds: string[];
}

export interface EnergyPosition {
  id: string;
  organizationId: string;
  energyBatchId: string;
  ownerId: string;
  companyId?: string;
  source: EnergySource;
  amountWh: EnergyWh;
  state: EnergyPositionState;
  gridAreaId?: string;
  intervalStart: Date;
  intervalEnd: Date;
  evidenceRoot: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyReservation {
  id: string;
  organizationId: string;
  energyPositionId: string;
  amountWh: EnergyWh;
  purpose: string;
  state: "ACTIVE" | "RELEASED" | "CONSUMED";
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyRetirement {
  id: string;
  organizationId: string;
  energyPositionId: string;
  amountWh: EnergyWh;
  reason: EnergyRetirementReason;
  settlementId?: string;
  tradeId?: string;
  receiptReference?: string;
  retiredAt: Date;
}

export class EnergyInvariantError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "EnergyInvariantError";
  }
}

export function parseWh(value: string | number | bigint): EnergyWh {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw new EnergyInvariantError("INVALID_ENERGY_QUANTITY", "Energy quantities must be non-negative safe integers in Wh");
    return BigInt(value);
  }
  if (!/^\d+$/.test(value)) throw new EnergyInvariantError("INVALID_ENERGY_QUANTITY", "Energy quantities must be decimal integer Wh strings");
  return BigInt(value);
}

export function economicallyBackedWh(batch: EnergyBatch): EnergyWh {
  if (batch.verifiedWh < 0n || batch.invalidatedWh < 0n || batch.retiredWh < 0n) throw new EnergyInvariantError("NEGATIVE_ENERGY_ACCOUNTING", "Energy accounting quantities cannot be negative");
  if (batch.invalidatedWh + batch.retiredWh > batch.verifiedWh) throw new EnergyInvariantError("BATCH_BACKING_UNDERFLOW", `Batch ${batch.id} invalidated + retired energy exceeds verified backing`);
  return batch.verifiedWh - batch.invalidatedWh - batch.retiredWh;
}

export function assertBatchCanIssuePosition(batch: EnergyBatch, activePositionWh: EnergyWh, requestedWh: EnergyWh): void {
  if (batch.state !== "FINALIZED") throw new EnergyInvariantError("BATCH_NOT_FINALIZED", `Batch ${batch.id} must be FINALIZED before issuing Energy Positions`);
  if (requestedWh <= 0n) throw new EnergyInvariantError("POSITION_AMOUNT_INVALID", "Energy Position amount must be greater than zero");
  const backed = economicallyBackedWh(batch);
  if (activePositionWh + requestedWh > backed) throw new EnergyInvariantError("ENERGY_POSITION_OVERISSUANCE", `Active Energy Positions would exceed ${backed} Wh of verified backing`);
}

export function activeReservationWh(reservations: readonly EnergyReservation[]): EnergyWh {
  return reservations.filter((item) => item.state === "ACTIVE").reduce((sum, item) => sum + item.amountWh, 0n);
}

export function positionAvailableWh(input: { position: EnergyPosition; reservations: readonly EnergyReservation[]; representedWh: EnergyWh; retiredWh: EnergyWh }): EnergyWh {
  const reservedWh = activeReservationWh(input.reservations);
  const active = reservedWh + input.representedWh + input.retiredWh;
  if (active > input.position.amountWh) throw new EnergyInvariantError("ENERGY_POSITION_OVERALLOCATED", `Position ${input.position.id} allocates ${active} Wh from ${input.position.amountWh} Wh canonical backing`);
  return input.position.amountWh - active;
}

export function assertPositionAllocation(input: { position: EnergyPosition; reservations: readonly EnergyReservation[]; representedWh: EnergyWh; retiredWh: EnergyWh; requestedWh: EnergyWh }): void {
  if (input.requestedWh <= 0n) throw new EnergyInvariantError("ALLOCATION_AMOUNT_INVALID", "Allocation amount must be greater than zero");
  const available = positionAvailableWh(input);
  if (input.requestedWh > available) throw new EnergyInvariantError("ENERGY_POSITION_BACKING_EXCEEDED", `Requested ${input.requestedWh} Wh exceeds ${available} Wh remaining canonical backing`);
}

const transitions: Record<EnergyPositionState, readonly EnergyPositionState[]> = {
  AVAILABLE: ["RESERVED", "COMMITTED", "TRANSFERRED", "RETIRED"],
  RESERVED: ["AVAILABLE", "RELEASED", "COMMITTED", "RETIRED"],
  COMMITTED: ["DELIVERING", "DISPUTED"],
  DELIVERING: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["SETTLING", "DISPUTED"],
  SETTLING: ["SETTLED", "DISPUTED"],
  SETTLED: ["RETIRED"],
  RETIRED: [],
  RELEASED: ["AVAILABLE"],
  TRANSFERRED: ["AVAILABLE", "COMMITTED"],
  DISPUTED: ["RECONCILED"],
  RECONCILED: ["SETTLING", "SETTLED", "RETIRED"],
};

export function transitionEnergyPosition(current: EnergyPositionState, next: EnergyPositionState): EnergyPositionState {
  if (current === next) return current;
  if (!transitions[current].includes(next)) throw new EnergyInvariantError("INVALID_ENERGY_POSITION_TRANSITION", `${current} cannot transition to ${next}`);
  return next;
}

export function canonicalize(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}
