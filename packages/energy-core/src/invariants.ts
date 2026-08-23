import type { EnergyBatch, EnergyPosition } from "./types.js";
import type { EnergyWh } from "./units.js";

export class EnergyInvariantError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "EnergyInvariantError";
    this.code = code;
  }
}

export function economicallyBackedWh(batch: EnergyBatch): EnergyWh {
  if (batch.invalidatedWh > batch.verifiedWh) {
    throw new EnergyInvariantError("INVALIDATION_EXCEEDS_VERIFIED", "Invalidated energy exceeds verified energy");
  }
  return batch.verifiedWh - batch.invalidatedWh;
}

export function availableBatchWh(batch: EnergyBatch): EnergyWh {
  const backed = economicallyBackedWh(batch);
  const active = batch.representedWh + batch.reservedWh;
  if (active > backed) {
    throw new EnergyInvariantError(
      "ENERGY_OVERALLOCATED",
      `Batch ${batch.id} has ${active} active Wh from ${backed} backed Wh`,
    );
  }
  if (batch.retiredWh > batch.verifiedWh) {
    throw new EnergyInvariantError("RETIREMENT_EXCEEDS_VERIFIED", "Retirement exceeds verified physical energy");
  }
  return backed - active;
}

export function assertRepresentationBacked(
  canonicalWh: EnergyWh,
  representedWhByChain: readonly EnergyWh[],
): void {
  const total = representedWhByChain.reduce((sum, amount) => sum + amount, 0n);
  if (total > canonicalWh) {
    throw new EnergyInvariantError(
      "CROSS_CHAIN_OVERREPRESENTATION",
      `Represented ${total} Wh exceeds canonical ${canonicalWh} Wh`,
    );
  }
}

export function assertPositionBacked(position: EnergyPosition, batch: EnergyBatch): void {
  if (position.energyBatchId !== batch.id) {
    throw new EnergyInvariantError("BATCH_MISMATCH", "Energy Position references a different batch");
  }
  if (position.amountWh > economicallyBackedWh(batch)) {
    throw new EnergyInvariantError("POSITION_UNBACKED", "Energy Position exceeds backed batch energy");
  }
}
