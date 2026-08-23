import type { EnergyPositionState } from "./types.js";

const NEXT: Record<EnergyPositionState, readonly EnergyPositionState[]> = {
  AVAILABLE: ["RESERVED", "TRANSFERRED", "RETIRED"],
  RESERVED: ["RELEASED", "COMMITTED"],
  RELEASED: ["AVAILABLE"],
  COMMITTED: ["DELIVERING"],
  DELIVERING: ["DELIVERED", "DISPUTED"],
  DELIVERED: ["SETTLING", "DISPUTED"],
  SETTLING: ["SETTLED", "DISPUTED"],
  DISPUTED: ["RECONCILED"],
  RECONCILED: ["SETTLING", "SETTLED", "RETIRED"],
  SETTLED: ["RETIRED"],
  TRANSFERRED: ["AVAILABLE", "RESERVED"],
  RETIRED: [],
};

export function canTransitionEnergyPosition(from: EnergyPositionState, to: EnergyPositionState): boolean {
  return NEXT[from].includes(to);
}

export function transitionEnergyPosition(from: EnergyPositionState, to: EnergyPositionState): EnergyPositionState {
  if (!canTransitionEnergyPosition(from, to)) {
    throw new Error(`Invalid Energy Position transition: ${from} -> ${to}`);
  }
  return to;
}
