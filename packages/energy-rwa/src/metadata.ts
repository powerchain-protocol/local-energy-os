import type { EnergyBatch, EnergyPosition } from "@powerchain/energy-core";
import type {
  EnergyEvidenceReference,
  EnergyProvenanceMetadata,
  EnergyRwaDenomination,
  Pet20EnergyMetadataV1,
} from "./types.js";
import { deterministicSha256 } from "./serialization.js";

export interface Pet20MetadataInput {
  tenantId: string;
  organizationId: string;
  denomination: EnergyRwaDenomination;
  position: EnergyPosition;
  batch: EnergyBatch;
  provenance: EnergyProvenanceMetadata;
  evidence?: EnergyEvidenceReference[];
  createdAt?: Date;
}

export function buildPet20EnergyMetadata(input: Pet20MetadataInput): {
  metadata: Pet20EnergyMetadataV1;
  digest: string;
} {
  if (input.position.energyBatchId !== input.batch.id) {
    throw new Error("PET20_BATCH_MISMATCH");
  }
  if (input.position.amountWh > input.batch.verifiedWh - input.batch.invalidatedWh) {
    throw new Error("PET20_UNBACKED_POSITION");
  }

  const metadata: Pet20EnergyMetadataV1 = {
    standard: "PET-20",
    version: "1.0.0",
    assetClass: "ENERGY_RWA",
    canonicalUnit: "Wh",
    denomination: input.denomination,
    positionId: input.position.id,
    batchId: input.batch.id,
    tenantId: input.tenantId,
    organizationId: input.organizationId,
    ownerId: input.position.ownerId,
    amountWh: input.position.amountWh.toString(),
    source: input.position.source,
    interval: {
      start: input.position.intervalStart.toISOString(),
      end: input.position.intervalEnd.toISOString(),
    },
    provenance: input.provenance,
    evidence: input.evidence ?? [{
      evidenceRoot: input.position.evidenceRoot,
      algorithm: "MERKLE-SHA256",
    }],
    representationPolicy: {
      tokenizationOptional: true,
      maximumActiveWh: input.position.amountWh.toString(),
      physicalEnergyAuthoritative: true,
    },
    createdAt: (input.createdAt ?? new Date()).toISOString(),
  };

  return { metadata, digest: deterministicSha256(metadata) };
}
