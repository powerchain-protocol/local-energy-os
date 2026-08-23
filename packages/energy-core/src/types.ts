import type { EnergyWh } from "./units.js";

export type EnergySource =
  | "SOLAR"
  | "WIND"
  | "HYDRO"
  | "GRID"
  | "STORAGE_DISCHARGE"
  | "GEOTHERMAL"
  | "BIOMASS"
  | "OTHER";

export type ParticipantType = "PROSUMER" | "CONSUMER" | "CLIENT" | "GRID_OPERATOR";
export type OperatorRole =
  | "ENERGY_COMPANY"
  | "UTILITY"
  | "AGGREGATOR"
  | "PLANT_OPERATOR"
  | "WIND_OPERATOR"
  | "SOLAR_OPERATOR"
  | "CHARGING_OPERATOR"
  | "METER_OPERATOR"
  | "GRID_OPERATOR"
  | "ENERGY_COMMUNITY";

export type WorkspaceContextType =
  | "HOUSEHOLD"
  | "COMMUNITY"
  | "COMPANY"
  | "CLIENT"
  | "GRID_OPERATOR"
  | "PORTFOLIO"
  | "VPP";

export interface EnergyMeasurement {
  id: string;
  siteId: string;
  meterId: string;
  intervalStart: Date;
  intervalEnd: Date;
  importWh: EnergyWh;
  exportWh: EnergyWh;
  source?: EnergySource;
  signature?: string;
  receivedAt: Date;
}

export interface EnergyProof {
  id: string;
  batchId: string;
  siteId: string;
  meterId: string;
  source: EnergySource;
  measuredWh: EnergyWh;
  verifiedWh: EnergyWh;
  intervalStart: Date;
  intervalEnd: Date;
  qualityScore: number;
  evidenceRoot: string;
  verifier: string;
  verificationVersion: string;
}

export type EnergyBatchState =
  | "COLLECTING"
  | "VALIDATING"
  | "VERIFIED"
  | "FINALIZED"
  | "TOKENIZABLE"
  | "PARTIALLY_TOKENIZED"
  | "FULLY_TOKENIZED"
  | "CLOSED"
  | "DISPUTED"
  | "CORRECTED"
  | "REVOKED";

export interface EnergyBatch {
  id: string;
  siteId: string;
  gridAreaId?: string;
  source: EnergySource;
  intervalStart: Date;
  intervalEnd: Date;
  measuredWh: EnergyWh;
  verifiedWh: EnergyWh;
  reservedWh: EnergyWh;
  representedWh: EnergyWh;
  retiredWh: EnergyWh;
  invalidatedWh: EnergyWh;
  state: EnergyBatchState;
  evidenceRoot: string;
  version: number;
}

export type EnergyPositionState =
  | "AVAILABLE"
  | "RESERVED"
  | "RELEASED"
  | "COMMITTED"
  | "DELIVERING"
  | "DELIVERED"
  | "SETTLING"
  | "DISPUTED"
  | "RECONCILED"
  | "SETTLED"
  | "TRANSFERRED"
  | "RETIRED";

export type EnergyRetirementReason =
  | "CONSUMED"
  | "SETTLED"
  | "CERTIFIED"
  | "INVALIDATED"
  | "CANCELLED"
  | "MIGRATED";

export interface EnergyPosition {
  id: string;
  energyBatchId: string;
  ownerId: string;
  amountWh: EnergyWh;
  source: EnergySource;
  state: EnergyPositionState;
  gridAreaId?: string;
  connectionPointId?: string;
  intervalStart: Date;
  intervalEnd: Date;
  evidenceRoot: string;
  provenanceId?: string;
}

export interface EnergyRetirement {
  id: string;
  energyPositionId: string;
  amountWh: EnergyWh;
  reason: EnergyRetirementReason;
  tradeId?: string;
  settlementId?: string;
  evidenceRoot?: string;
  receiptReference?: string;
  retiredAt: Date;
}
