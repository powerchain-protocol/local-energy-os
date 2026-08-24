CREATE TYPE "DigitalEnergyTwinAssetType" AS ENUM ('SOLAR_ARRAY','WIND_TURBINE','BATTERY','EVSE','SMART_METER','GRID_NODE','PLANT');
CREATE TYPE "DigitalEnergyTwinState" AS ENUM ('OPERATIONAL','DEGRADED','STALE','OFFLINE','MAINTENANCE');
CREATE TYPE "DigitalEnergyTelemetryFreshness" AS ENUM ('FRESH','AGING','STALE','UNAVAILABLE');
CREATE TYPE "DigitalEnergyDeliveryState" AS ENUM ('COMMITTED','DELIVERING','DELIVERED','DISPUTED','RECONCILED','CANCELLED');
CREATE TYPE "DigitalEnergyReconciliationState" AS ENUM ('MATCHED','WITHIN_TOLERANCE','REVIEW_REQUIRED','RECONCILED');
CREATE TYPE "DigitalEnergySettlementAsset" AS ENUM ('USDC','EURC','FIAT_EUR');
CREATE TYPE "DigitalEnergySettlementNetwork" AS ENUM ('SOLANA','OFFCHAIN');
CREATE TYPE "DigitalEnergySettlementState" AS ENUM ('READY','SUBMITTED','CONFIRMED','RECONCILED','FAILED','CANCELLED');

CREATE TABLE "digital_energy_twin_assets" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "asset_type" "DigitalEnergyTwinAssetType" NOT NULL,
  "label" TEXT NOT NULL,
  "grid_area_id" TEXT,
  "observed_at" TIMESTAMP(3) NOT NULL,
  "telemetry_age_seconds" INTEGER NOT NULL,
  "freshness" "DigitalEnergyTelemetryFreshness" NOT NULL,
  "state" "DigitalEnergyTwinState" NOT NULL,
  "power_w" BIGINT,
  "availability_ppm" BIGINT,
  "state_of_charge_ppm" BIGINT,
  "export_limit_w" BIGINT,
  "evidence_root" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "digital_energy_twin_assets_org_state_idx" ON "digital_energy_twin_assets"("organization_id","state");
CREATE INDEX "digital_energy_twin_assets_org_site_idx" ON "digital_energy_twin_assets"("organization_id","site_id");

CREATE TABLE "digital_energy_deliveries" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "energy_position_id" TEXT NOT NULL,
  "reservation_id" TEXT,
  "committed_wh" BIGINT NOT NULL,
  "delivered_wh" BIGINT NOT NULL DEFAULT 0,
  "state" "DigitalEnergyDeliveryState" NOT NULL DEFAULT 'COMMITTED',
  "interval_start" TIMESTAMP(3) NOT NULL,
  "interval_end" TIMESTAMP(3) NOT NULL,
  "meter_evidence_root" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "digital_energy_deliveries_position_fk" FOREIGN KEY ("energy_position_id") REFERENCES "digital_energy_positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "digital_energy_deliveries_org_state_idx" ON "digital_energy_deliveries"("organization_id","state");
CREATE INDEX "digital_energy_deliveries_position_idx" ON "digital_energy_deliveries"("energy_position_id");

CREATE TABLE "digital_energy_reconciliations" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "delivery_id" TEXT NOT NULL,
  "expected_wh" BIGINT NOT NULL,
  "delivered_wh" BIGINT NOT NULL,
  "variance_wh" BIGINT NOT NULL,
  "tolerance_wh" BIGINT NOT NULL,
  "state" "DigitalEnergyReconciliationState" NOT NULL,
  "reconciled_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "digital_energy_reconciliations_delivery_fk" FOREIGN KEY ("delivery_id") REFERENCES "digital_energy_deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "digital_energy_reconciliations_org_state_idx" ON "digital_energy_reconciliations"("organization_id","state");
CREATE INDEX "digital_energy_reconciliations_delivery_idx" ON "digital_energy_reconciliations"("delivery_id");

CREATE TABLE "digital_energy_settlements" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "delivery_id" TEXT NOT NULL,
  "reconciliation_id" TEXT NOT NULL,
  "asset" "DigitalEnergySettlementAsset" NOT NULL,
  "network" "DigitalEnergySettlementNetwork" NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "state" "DigitalEnergySettlementState" NOT NULL DEFAULT 'READY',
  "reference" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "digital_energy_settlements_delivery_fk" FOREIGN KEY ("delivery_id") REFERENCES "digital_energy_deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "digital_energy_settlements_reconciliation_fk" FOREIGN KEY ("reconciliation_id") REFERENCES "digital_energy_reconciliations"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "digital_energy_settlements_org_state_idx" ON "digital_energy_settlements"("organization_id","state");
CREATE INDEX "digital_energy_settlements_delivery_idx" ON "digital_energy_settlements"("delivery_id");
CREATE INDEX "digital_energy_settlements_reconciliation_idx" ON "digital_energy_settlements"("reconciliation_id");
