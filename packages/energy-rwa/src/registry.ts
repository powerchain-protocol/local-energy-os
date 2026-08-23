import { assertRepresentationBacked } from "@powerchain/energy-core";
import type { ChainRepresentation, EnergyRwaRegistry } from "./types.js";

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
  const duplicate = registry.representations.some((item) =>
    item.network === representation.network && item.reference === representation.reference);
  if (duplicate) throw new Error("DUPLICATE_CHAIN_REPRESENTATION");
  return validateRegistry({
    ...registry,
    representations: [...registry.representations, representation],
  });
}
