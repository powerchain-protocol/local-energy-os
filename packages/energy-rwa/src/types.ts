import type { EnergyPosition, EnergySource, EnergyWh } from "@powerchain/energy-core";

export type EnergyRwaNetwork = "SOLANA" | "SUI";
export type RepresentationState = "ACTIVE" | "LOCKED" | "BURNING" | "MIGRATING" | "RETIRED";
export type EnergyRwaDenomination = "kWh" | "MWh";

export interface EnergyIntervalMetadata {
  start: string;
  end: string;
  timezone?: string;
  resolutionSeconds?: number;
}

export interface EnergyEvidenceReference {
  evidenceRoot: string;
  algorithm: "SHA-256" | "MERKLE-SHA256";
  verifier?: string;
  verificationVersion?: string;
  contentHash?: string;
  uri?: string;
}

export interface EnergyProvenanceMetadata {
  source: EnergySource;
  siteId: string;
  meterId?: string;
  meteringPointId?: string;
  gridAreaId?: string;
  feederId?: string;
  connectionPointId?: string;
  generationAssetId?: string;
  storageLotId?: string;
  storageInputPositionIds?: string[];
  carbonIntensityGco2ePerKwh?: string;
  environmentalAttributeRefs?: string[];
}

/**
 * PowerChain PET-20 metadata profile for verified Energy RWA positions.
 * PET-20 is a PowerChain metadata profile, not an assertion that electricity
 * itself is a token. `amountWh` and backing references remain authoritative.
 */
export interface Pet20EnergyMetadataV1 {
  standard: "PET-20";
  version: "1.0.0";
  assetClass: "ENERGY_RWA";
  canonicalUnit: "Wh";
  denomination: EnergyRwaDenomination;
  positionId: string;
  batchId: string;
  tenantId: string;
  organizationId: string;
  ownerId: string;
  amountWh: string;
  source: EnergySource;
  interval: EnergyIntervalMetadata;
  provenance: EnergyProvenanceMetadata;
  evidence: EnergyEvidenceReference[];
  representationPolicy: {
    tokenizationOptional: true;
    maximumActiveWh: string;
    physicalEnergyAuthoritative: true;
  };
  createdAt: string;
}

export interface ChainRepresentation {
  energyPositionId: string;
  network: EnergyRwaNetwork;
  reference: string;
  amountWh: EnergyWh;
  state: RepresentationState;
  explorerUrl?: string;
}

export interface EnergyRwaRegistry {
  energyPositionId: string;
  canonicalWh: EnergyWh;
  representations: ChainRepresentation[];
}

export interface TenantScopedEnergyRwa {
  id: string;
  tenantId: string;
  organizationId: string;
  companyId?: string;
  position: EnergyPosition;
  metadata: Pet20EnergyMetadataV1;
  metadataDigest: string;
  registry: EnergyRwaRegistry;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnergyRwaAccessContext {
  tenantId: string;
  organizationId?: string;
  companyId?: string;
  actorId?: string;
  scopes?: string[];
}
