import type { EnergyRwaUnit, EnergySource } from "@powerchain/contracts";

export class ApiValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly status = 422;
  constructor(message: string, readonly field?: string) {
    super(message);
    this.name = "ApiValidationError";
  }
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiValidationError("Expected a JSON object");
  }
  return value as Record<string, unknown>;
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiValidationError(`${field} is required`, field);
  }
  return value.trim();
}

export function optionalString(value: unknown, field: string): string | undefined {
  if (value == null) return undefined;
  return requireString(value, field);
}

export function parseBigIntString(value: unknown, field: string, minimum = 0n): bigint {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) {
    throw new ApiValidationError(`${field} must be an integer string`, field);
  }
  const parsed = BigInt(value);
  if (parsed < minimum) throw new ApiValidationError(`${field} must be >= ${minimum}`, field);
  return parsed;
}

export function parseIsoDate(value: unknown, field: string): Date {
  const raw = requireString(value, field);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new ApiValidationError(`${field} must be an ISO-8601 timestamp`, field);
  return parsed;
}

const ENERGY_SOURCES = new Set<EnergySource>(["SOLAR", "WIND", "HYDRO", "GEOTHERMAL", "BIOMASS", "GRID", "STORAGE_DISCHARGE"]);
const ENERGY_UNITS = new Set<EnergyRwaUnit>(["KWH", "MWH"]);

export function parseEnergySource(value: unknown, field = "source"): EnergySource {
  const source = requireString(value, field) as EnergySource;
  if (!ENERGY_SOURCES.has(source)) throw new ApiValidationError(`${field} is not a supported energy source`, field);
  return source;
}

export function parseEnergyRwaUnit(value: unknown, field = "unit"): EnergyRwaUnit {
  const unit = requireString(value, field) as EnergyRwaUnit;
  if (!ENERGY_UNITS.has(unit)) throw new ApiValidationError(`${field} must be KWH or MWH`, field);
  return unit;
}

export interface CreateEnergyProofInput {
  siteId: string;
  meterId: string;
  source: EnergySource;
  measuredWh: bigint;
  verifiedWh: bigint;
  qualityScore: string;
  intervalStart: Date;
  intervalEnd: Date;
  evidenceRoot: string;
}

export function parseCreateEnergyProofInput(value: unknown): CreateEnergyProofInput {
  const body = record(value);
  const input: CreateEnergyProofInput = {
    siteId: requireString(body.siteId, "siteId"),
    meterId: requireString(body.meterId, "meterId"),
    source: parseEnergySource(body.source),
    measuredWh: parseBigIntString(body.measuredWh, "measuredWh", 1n),
    verifiedWh: parseBigIntString(body.verifiedWh, "verifiedWh", 1n),
    qualityScore: requireString(body.qualityScore, "qualityScore"),
    intervalStart: parseIsoDate(body.intervalStart, "intervalStart"),
    intervalEnd: parseIsoDate(body.intervalEnd, "intervalEnd"),
    evidenceRoot: requireString(body.evidenceRoot, "evidenceRoot"),
  };
  if (input.verifiedWh > input.measuredWh) throw new ApiValidationError("verifiedWh cannot exceed measuredWh", "verifiedWh");
  if (input.intervalEnd <= input.intervalStart) throw new ApiValidationError("intervalEnd must be after intervalStart", "intervalEnd");
  const quality = Number(input.qualityScore);
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) throw new ApiValidationError("qualityScore must be between 0 and 1", "qualityScore");
  return input;
}

export interface CreateBatchInput { proofId: string }
export function parseCreateBatchInput(value: unknown): CreateBatchInput {
  const body = record(value);
  return { proofId: requireString(body.proofId, "proofId") };
}

export interface IssuePositionInput { batchId: string; amountWh: bigint; unit: EnergyRwaUnit; canonicalChain?: "SOLANA" | "SUI" }
export function parseIssuePositionInput(value: unknown): IssuePositionInput {
  const body = record(value);
  const chain = optionalString(body.canonicalChain, "canonicalChain");
  if (chain && chain !== "SOLANA" && chain !== "SUI") throw new ApiValidationError("canonicalChain must be SOLANA or SUI", "canonicalChain");
  return {
    batchId: requireString(body.batchId, "batchId"),
    amountWh: parseBigIntString(body.amountWh, "amountWh", 1n),
    unit: parseEnergyRwaUnit(body.unit),
    canonicalChain: chain as "SOLANA" | "SUI" | undefined,
  };
}

export interface PositionAmountInput { positionId: string; amountWh: bigint; orderId?: string; reason?: string; settlementId?: string }
export function parsePositionAmountInput(value: unknown): PositionAmountInput {
  const body = record(value);
  return {
    positionId: requireString(body.positionId, "positionId"),
    amountWh: parseBigIntString(body.amountWh, "amountWh", 1n),
    orderId: optionalString(body.orderId, "orderId"),
    reason: optionalString(body.reason, "reason"),
    settlementId: optionalString(body.settlementId, "settlementId"),
  };
}
