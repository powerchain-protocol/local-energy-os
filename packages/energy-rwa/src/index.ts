import { assertPhysicalSupply, KWH, MWH } from "@powerchain/energy-core";
import type { EnergyRwaUnit, EnergySource, PositionState } from "@powerchain/contracts";

export interface EnergyBatchState {
  id: string;
  verifiedWh: bigint;
  invalidatedWh: bigint;
  positionedWh: bigint;
  retiredWh: bigint;
  source: EnergySource;
  evidenceRoot: string;
}
export interface EnergyRwaPosition {
  id: string; batchId: string; amountWh: bigint; unit: EnergyRwaUnit; state: PositionState;
  reservedWh: bigint; retiredWh: bigint; chain?: "SOLANA" | "SUI";
}

export function unitWh(unit: EnergyRwaUnit) { return unit === "MWH" ? MWH : KWH; }

export function issuePosition(batch: EnergyBatchState, input: { id: string; amountWh: bigint; unit: EnergyRwaUnit; chain?: "SOLANA"|"SUI" }): EnergyRwaPosition {
  if (input.amountWh <= 0n) throw new Error("INVALID_ENERGY_RWA_AMOUNT");
  if (input.amountWh % unitWh(input.unit) !== 0n) throw new Error("ENERGY_RWA_UNIT_ALIGNMENT");
  assertPhysicalSupply({ verifiedWh: batch.verifiedWh, invalidatedWh: batch.invalidatedWh, positionedWh: batch.positionedWh + input.amountWh });
  return { id: input.id, batchId: batch.id, amountWh: input.amountWh, unit: input.unit, state: "AVAILABLE", reservedWh: 0n, retiredWh: 0n, chain: input.chain };
}

export function reservePosition(position: EnergyRwaPosition, amountWh: bigint): EnergyRwaPosition {
  if (amountWh <= 0n || position.reservedWh + amountWh > position.amountWh - position.retiredWh) throw new Error("INSUFFICIENT_ENERGY_RWA_AVAILABLE");
  return { ...position, reservedWh: position.reservedWh + amountWh, state: "RESERVED" };
}

export function releasePosition(position: EnergyRwaPosition, amountWh: bigint): EnergyRwaPosition {
  if (amountWh <= 0n || amountWh > position.reservedWh) throw new Error("INVALID_RELEASE_AMOUNT");
  const reservedWh = position.reservedWh - amountWh;
  return { ...position, reservedWh, state: reservedWh === 0n ? "AVAILABLE" : "RESERVED" };
}

export function retirePosition(position: EnergyRwaPosition, amountWh: bigint): EnergyRwaPosition {
  if (amountWh <= 0n || position.retiredWh + amountWh > position.amountWh) throw new Error("INVALID_RETIREMENT_AMOUNT");
  const retiredWh = position.retiredWh + amountWh;
  return { ...position, retiredWh, reservedWh: position.reservedWh > amountWh ? position.reservedWh - amountWh : 0n, state: retiredWh === position.amountWh ? "RETIRED" : position.state };
}
