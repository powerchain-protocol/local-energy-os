import { assertRepresentationBacked, type EnergyWh } from "@powerchain/energy-core";

export type EnergyRwaNetwork = "SOLANA" | "SUI";
export type RepresentationState = "ACTIVE" | "LOCKED" | "BURNING" | "MIGRATING" | "RETIRED";

export interface ChainRepresentation {
  energyPositionId: string;
  network: EnergyRwaNetwork;
  reference: string;
  amountWh: EnergyWh;
  state: RepresentationState;
}

export interface EnergyRwaRegistry {
  energyPositionId: string;
  canonicalWh: EnergyWh;
  representations: ChainRepresentation[];
}

export function validateRegistry(registry: EnergyRwaRegistry): EnergyRwaRegistry {
  const active = registry.representations
    .filter((entry) => entry.state !== "RETIRED")
    .map((entry) => entry.amountWh);
  assertRepresentationBacked(registry.canonicalWh, active);
  return registry;
}

export function allocateRepresentation(
  registry: EnergyRwaRegistry,
  representation: ChainRepresentation,
): EnergyRwaRegistry {
  if (representation.energyPositionId !== registry.energyPositionId) {
    throw new Error("Representation references a different Energy Position");
  }
  const next = {...registry, representations: [...registry.representations, representation]};
  return validateRegistry(next);
}
