import { assertRepresentationBacked, type EnergyWh } from "@powerchain/energy-core";
export interface ChainEnergyAllocation { network: "SOLANA" | "SUI"; amountWh: EnergyWh; active: boolean; reference?: string; }
export function validateEnergyAllocations(canonicalWh: EnergyWh, allocations: readonly ChainEnergyAllocation[]) {
  assertRepresentationBacked(canonicalWh, allocations.filter((a) => a.active).map((a) => a.amountWh));
  return allocations;
}
