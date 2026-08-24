import { EnergyInvariantError, type EnergyPosition, type EnergyReservation, type EnergyRetirement, type EnergyWh, positionAvailableWh } from "@powerchain/energy-core";

export const PET20_VERSION = "1.0.0" as const;
export const ENERGY_RWA_ASSET_CLASS = "VERIFIED_ENERGY_POSITION" as const;
export const ENERGY_RWA_BACKING_LEDGER = "POWERCHAIN_ENERGY_LEDGER" as const;
export type EnergyRepresentationNetwork = "SOLANA" | "SUI";
export type EnergyRepresentationState = "ACTIVE" | "LOCKED" | "MIGRATING" | "BURNING" | "RETIRED";

export interface ChainRepresentation {
  id: string;
  organizationId: string;
  energyPositionId: string;
  network: EnergyRepresentationNetwork;
  reference: string;
  amountWh: EnergyWh;
  state: EnergyRepresentationState;
  metadataStandard: typeof PET20_VERSION;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pet20Metadata {
  standard: "PET-20";
  version: typeof PET20_VERSION;
  assetClass: typeof ENERGY_RWA_ASSET_CLASS;
  backingLedger: typeof ENERGY_RWA_BACKING_LEDGER;
  canonicalUnit: "Wh";
  physicalEnergyAuthoritative: true;
  tokenizationOptional: true;
  organizationId: string;
  energyPositionId: string;
  energyBatchId: string;
  source: EnergyPosition["source"];
  amountWh: string;
  gridAreaId?: string;
  intervalStart: string;
  intervalEnd: string;
  evidenceRoot: string;
  representationPolicy: {
    supportedNetworks: readonly ["SOLANA", "SUI"];
    activeCrossChainRepresentationsMustNotExceedBacking: true;
  };
}

export interface EnergyRwaRecord {
  id: string;
  organizationId: string;
  position: EnergyPosition;
  metadata: Pet20Metadata;
  representations: ChainRepresentation[];
  reservations: EnergyReservation[];
  retirements: EnergyRetirement[];
  createdAt: Date;
  updatedAt: Date;
}

export function createPet20Metadata(position: EnergyPosition): Pet20Metadata {
  return {
    standard: "PET-20",
    version: PET20_VERSION,
    assetClass: ENERGY_RWA_ASSET_CLASS,
    backingLedger: ENERGY_RWA_BACKING_LEDGER,
    canonicalUnit: "Wh",
    physicalEnergyAuthoritative: true,
    tokenizationOptional: true,
    organizationId: position.organizationId,
    energyPositionId: position.id,
    energyBatchId: position.energyBatchId,
    source: position.source,
    amountWh: position.amountWh.toString(),
    ...(position.gridAreaId ? { gridAreaId: position.gridAreaId } : {}),
    intervalStart: position.intervalStart.toISOString(),
    intervalEnd: position.intervalEnd.toISOString(),
    evidenceRoot: position.evidenceRoot,
    representationPolicy: {
      supportedNetworks: ["SOLANA", "SUI"],
      activeCrossChainRepresentationsMustNotExceedBacking: true,
    },
  };
}

export function activeRepresentedWh(representations: readonly ChainRepresentation[]): EnergyWh {
  return representations.filter((item) => item.state !== "RETIRED").reduce((sum, item) => sum + item.amountWh, 0n);
}

export function retiredPositionWh(retirements: readonly EnergyRetirement[]): EnergyWh {
  return retirements.reduce((sum, item) => sum + item.amountWh, 0n);
}

export function assertRepresentationBacked(record: Pick<EnergyRwaRecord, "position" | "reservations" | "representations" | "retirements">, requestedWh = 0n): void {
  const representedWh = activeRepresentedWh(record.representations);
  const retiredWh = retiredPositionWh(record.retirements);
  positionAvailableWh({ position: record.position, reservations: record.reservations, representedWh, retiredWh });
  if (requestedWh > 0n) {
    const available = positionAvailableWh({ position: record.position, reservations: record.reservations, representedWh, retiredWh });
    if (requestedWh > available) throw new EnergyInvariantError("CROSS_CHAIN_OVERISSUANCE", `Requested ${requestedWh} Wh exceeds ${available} Wh available for chain representation`);
  }
}

export function representationCoveragePpm(record: Pick<EnergyRwaRecord, "position" | "representations">): bigint {
  if (record.position.amountWh === 0n) return 0n;
  return activeRepresentedWh(record.representations) * 1_000_000n / record.position.amountWh;
}

export function assertCanRetirePosition(record: Pick<EnergyRwaRecord, "representations">): void {
  if (record.representations.some((item) => item.state !== "RETIRED")) throw new EnergyInvariantError("ACTIVE_CHAIN_REPRESENTATIONS_MUST_RETIRE_FIRST", "Retire or migrate active Solana/Sui Energy RWA representations before retiring canonical backing");
}

export function explorerUrl(representation: Pick<ChainRepresentation, "network" | "reference">): string {
  const reference = encodeURIComponent(representation.reference);
  return representation.network === "SOLANA"
    ? `https://solscan.io/token/${reference}`
    : `https://suiscan.xyz/mainnet/object/${reference}/tx-blocks`;
}
