CREATE TYPE "DigitalEnergyApprovalDecision" AS ENUM ('APPROVED','REJECTED');
CREATE TYPE "DigitalEnergyOutboxState" AS ENUM ('PENDING','PROCESSING','PUBLISHED','FAILED');

ALTER TABLE "digital_energy_settlements"
  ADD COLUMN "review_hash" TEXT,
  ADD COLUMN "created_by" TEXT,
  ADD COLUMN "approvals_required" INTEGER NOT NULL DEFAULT 2;

-- Existing pre-control settlements are deliberately marked as legacy/unreviewed.
-- They are not represented as a canonical POWERCHAIN_SETTLEMENT_REVIEW_V1 SHA-256 digest.
UPDATE "digital_energy_settlements"
SET "review_hash" = 'legacy-unreviewed:' || "id",
    "created_by" = 'migration:legacy';

ALTER TABLE "digital_energy_settlements"
  ALTER COLUMN "review_hash" SET NOT NULL,
  ALTER COLUMN "created_by" SET NOT NULL;

CREATE TABLE "digital_energy_settlement_approvals" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "settlement_id" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "decision" "DigitalEnergyApprovalDecision" NOT NULL,
  "review_hash" TEXT NOT NULL,
  "note" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "digital_energy_settlement_approvals_settlement_fk"
    FOREIGN KEY ("settlement_id") REFERENCES "digital_energy_settlements"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "digital_energy_settlement_approvals_settlement_actor_key"
    UNIQUE ("settlement_id","actor_id")
);

CREATE INDEX "digital_energy_settlement_approvals_org_decision_idx"
  ON "digital_energy_settlement_approvals"("organization_id","decision");
CREATE INDEX "digital_energy_settlement_approvals_settlement_idx"
  ON "digital_energy_settlement_approvals"("settlement_id");

CREATE TABLE "digital_energy_outbox_events" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "aggregate_type" TEXT NOT NULL,
  "aggregate_id" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "state" "DigitalEnergyOutboxState" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "last_error" TEXT,
  "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processing_started_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" TIMESTAMP(3)
);

CREATE INDEX "digital_energy_outbox_org_state_next_created_idx"
  ON "digital_energy_outbox_events"("organization_id","state","next_attempt_at","created_at");
CREATE INDEX "digital_energy_outbox_state_next_idx"
  ON "digital_energy_outbox_events"("state","next_attempt_at");
CREATE INDEX "digital_energy_outbox_aggregate_idx"
  ON "digital_energy_outbox_events"("aggregate_type","aggregate_id");
