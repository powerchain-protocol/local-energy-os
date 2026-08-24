-- PowerChain Digital Energy OS v1.0.0
CREATE TYPE "DigitalEnergyProofState" AS ENUM ('PENDING','VERIFIED','REJECTED','INVALIDATED');
CREATE TYPE "DigitalEnergyBatchState" AS ENUM ('OPEN','FINALIZED','INVALIDATED');
CREATE TYPE "DigitalEnergyPositionState" AS ENUM ('AVAILABLE','RESERVED','COMMITTED','DELIVERING','DELIVERED','SETTLING','SETTLED','RETIRED','RELEASED','TRANSFERRED','DISPUTED','RECONCILED');
CREATE TYPE "DigitalEnergyReservationState" AS ENUM ('ACTIVE','RELEASED','CONSUMED');
CREATE TYPE "DigitalEnergyRepresentationNetwork" AS ENUM ('SOLANA','SUI');
CREATE TYPE "DigitalEnergyRepresentationState" AS ENUM ('ACTIVE','LOCKED','MIGRATING','BURNING','RETIRED');
CREATE TYPE "DigitalEnergyRetirementReason" AS ENUM ('CONSUMED','SETTLED','CERTIFIED','INVALIDATED','CANCELLED','MIGRATED');

CREATE TABLE "digital_energy_proofs" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "meter_id" TEXT NOT NULL,
  "metering_point_id" TEXT,
  "source" TEXT NOT NULL,
  "measured_wh" BIGINT NOT NULL CHECK ("measured_wh" >= 0),
  "verified_wh" BIGINT NOT NULL CHECK ("verified_wh" >= 0),
  "interval_start" TIMESTAMPTZ NOT NULL,
  "interval_end" TIMESTAMPTZ NOT NULL,
  "quality_score_ppm" BIGINT NOT NULL CHECK ("quality_score_ppm" BETWEEN 0 AND 1000000),
  "evidence_root" TEXT NOT NULL,
  "verifier" TEXT NOT NULL,
  "verification_version" TEXT NOT NULL,
  "state" "DigitalEnergyProofState" NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ("verified_wh" <= "measured_wh")
);

CREATE TABLE "digital_energy_batches" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "grid_area_id" TEXT,
  "source" TEXT NOT NULL,
  "interval_start" TIMESTAMPTZ NOT NULL,
  "interval_end" TIMESTAMPTZ NOT NULL,
  "measured_wh" BIGINT NOT NULL CHECK ("measured_wh" >= 0),
  "verified_wh" BIGINT NOT NULL CHECK ("verified_wh" >= 0),
  "invalidated_wh" BIGINT NOT NULL DEFAULT 0 CHECK ("invalidated_wh" >= 0),
  "retired_wh" BIGINT NOT NULL DEFAULT 0 CHECK ("retired_wh" >= 0),
  "state" "DigitalEnergyBatchState" NOT NULL,
  "evidence_root" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ("invalidated_wh" + "retired_wh" <= "verified_wh")
);

CREATE TABLE "digital_energy_batch_proofs" (
  "batch_id" TEXT NOT NULL REFERENCES "digital_energy_batches"("id") ON DELETE CASCADE,
  "proof_id" TEXT NOT NULL REFERENCES "digital_energy_proofs"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("batch_id","proof_id")
);

CREATE TABLE "digital_energy_positions" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "energy_batch_id" TEXT NOT NULL REFERENCES "digital_energy_batches"("id") ON DELETE RESTRICT,
  "owner_id" TEXT NOT NULL,
  "company_id" TEXT,
  "source" TEXT NOT NULL,
  "amount_wh" BIGINT NOT NULL CHECK ("amount_wh" > 0),
  "state" "DigitalEnergyPositionState" NOT NULL DEFAULT 'AVAILABLE',
  "grid_area_id" TEXT,
  "interval_start" TIMESTAMPTZ NOT NULL,
  "interval_end" TIMESTAMPTZ NOT NULL,
  "evidence_root" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "digital_energy_reservations" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "energy_position_id" TEXT NOT NULL REFERENCES "digital_energy_positions"("id") ON DELETE CASCADE,
  "amount_wh" BIGINT NOT NULL CHECK ("amount_wh" > 0),
  "purpose" TEXT NOT NULL,
  "state" "DigitalEnergyReservationState" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "digital_energy_representations" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "energy_position_id" TEXT NOT NULL REFERENCES "digital_energy_positions"("id") ON DELETE CASCADE,
  "network" "DigitalEnergyRepresentationNetwork" NOT NULL,
  "reference" TEXT NOT NULL,
  "amount_wh" BIGINT NOT NULL CHECK ("amount_wh" > 0),
  "state" "DigitalEnergyRepresentationState" NOT NULL DEFAULT 'ACTIVE',
  "metadata_standard" TEXT NOT NULL DEFAULT '1.0.0',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("network","reference")
);

CREATE TABLE "digital_energy_retirements" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "energy_position_id" TEXT NOT NULL REFERENCES "digital_energy_positions"("id") ON DELETE RESTRICT,
  "amount_wh" BIGINT NOT NULL CHECK ("amount_wh" > 0),
  "reason" "DigitalEnergyRetirementReason" NOT NULL,
  "settlement_id" TEXT,
  "trade_id" TEXT,
  "receipt_reference" TEXT,
  "retired_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "digital_energy_proofs_org_interval_idx" ON "digital_energy_proofs"("organization_id","interval_start" DESC);
CREATE INDEX "digital_energy_batches_org_interval_idx" ON "digital_energy_batches"("organization_id","interval_start" DESC);
CREATE INDEX "digital_energy_positions_org_state_idx" ON "digital_energy_positions"("organization_id","state");
CREATE INDEX "digital_energy_reservations_org_state_idx" ON "digital_energy_reservations"("organization_id","state");
CREATE INDEX "digital_energy_representations_org_state_idx" ON "digital_energy_representations"("organization_id","state");
CREATE INDEX "digital_energy_retirements_org_time_idx" ON "digital_energy_retirements"("organization_id","retired_at" DESC);

COMMENT ON TABLE "digital_energy_batches" IS 'Verified physical energy remains authoritative; digital representations are bounded by this backing.';
COMMENT ON TABLE "digital_energy_positions" IS 'Canonical Energy RWA backing positions denominated internally in integer Wh.';

CREATE TABLE "digital_energy_idempotency" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "response" JSONB NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("organization_id","scope","key")
);
CREATE INDEX "digital_energy_idempotency_expiry_idx" ON "digital_energy_idempotency"("expires_at");

CREATE TABLE "digital_energy_audit_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resource_id" TEXT,
  "request_id" TEXT NOT NULL,
  "correlation_id" TEXT NOT NULL,
  "data_mode" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "digital_energy_audit_events_org_time_idx" ON "digital_energy_audit_events"("organization_id","created_at" DESC);
CREATE INDEX "digital_energy_audit_events_action_idx" ON "digital_energy_audit_events"("action");
COMMENT ON TABLE "digital_energy_audit_events" IS 'Tenant-scoped immutable operational audit trail for Digital Energy OS economic actions.';
