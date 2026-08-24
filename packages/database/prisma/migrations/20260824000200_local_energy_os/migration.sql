CREATE TYPE "LocalEnergyListingMode" AS ENUM ('BUY','SELL','RENT');
CREATE TYPE "LocalEnergySource" AS ENUM ('SOLAR','WIND','HYDRO','BATTERY','MIXED');
CREATE TYPE "LocalEnergyListingState" AS ENUM ('ACTIVE','PAUSED','COMPLETED','CANCELLED');
CREATE TYPE "LocalEnergyOrderState" AS ENUM ('REVIEW_REQUIRED','RESERVED','DELIVERING','DELIVERED','RECONCILED','SETTLEMENT_READY','SETTLED','CANCELLED','DISPUTED');
CREATE TYPE "LocalEnergySettlementAsset" AS ENUM ('USDC','EURC','FIAT_EUR','PWRC');
CREATE TYPE "LocalEnergyFlexDirection" AS ENUM ('INCREASE_EXPORT','REDUCE_EXPORT','INCREASE_IMPORT','REDUCE_IMPORT');
CREATE TYPE "LocalEnergyFlexState" AS ENUM ('OPEN','RESERVED','DELIVERING','COMPLETED','CANCELLED');

CREATE TABLE "local_energy_listings" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "seller_organization_id" TEXT NOT NULL,
  "seller_name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "mode" "LocalEnergyListingMode" NOT NULL,
  "source" "LocalEnergySource" NOT NULL,
  "grid_area_id" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "quantity_wh" BIGINT NOT NULL,
  "available_wh" BIGINT NOT NULL,
  "minimum_wh" BIGINT NOT NULL,
  "export_limit_wh" BIGINT,
  "price_micros_per_kwh" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "settlement_asset" "LocalEnergySettlementAsset" NOT NULL,
  "renewable_percent" INTEGER NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "meter_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  "delivery_start" TIMESTAMP(3) NOT NULL,
  "delivery_end" TIMESTAMP(3) NOT NULL,
  "state" "LocalEnergyListingState" NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "local_energy_listing_quantity_positive" CHECK ("quantity_wh" > 0),
  CONSTRAINT "local_energy_listing_available_nonnegative" CHECK ("available_wh" >= 0),
  CONSTRAINT "local_energy_listing_available_backed" CHECK ("available_wh" <= "quantity_wh"),
  CONSTRAINT "local_energy_listing_minimum_positive" CHECK ("minimum_wh" > 0),
  CONSTRAINT "local_energy_listing_price_nonnegative" CHECK ("price_micros_per_kwh" >= 0),
  CONSTRAINT "local_energy_listing_renewable_percent" CHECK ("renewable_percent" BETWEEN 0 AND 100),
  CONSTRAINT "local_energy_listing_delivery_window" CHECK ("delivery_end" > "delivery_start")
);

CREATE INDEX "local_energy_listings_org_state_delivery_idx"
  ON "local_energy_listings"("organization_id","state","delivery_start");
CREATE INDEX "local_energy_listings_org_grid_state_idx"
  ON "local_energy_listings"("organization_id","grid_area_id","state");

CREATE TABLE "local_energy_orders" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "listing_id" TEXT NOT NULL,
  "buyer_id" TEXT NOT NULL,
  "quantity_wh" BIGINT NOT NULL,
  "expected_wh" BIGINT NOT NULL,
  "delivered_wh" BIGINT NOT NULL DEFAULT 0,
  "variance_wh" BIGINT NOT NULL DEFAULT 0,
  "subtotal_micros" BIGINT NOT NULL,
  "network_fee_micros" BIGINT NOT NULL,
  "reserve_micros" BIGINT NOT NULL,
  "total_micros" BIGINT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'EUR',
  "settlement_asset" "LocalEnergySettlementAsset" NOT NULL,
  "state" "LocalEnergyOrderState" NOT NULL DEFAULT 'REVIEW_REQUIRED',
  "idempotency_key" TEXT NOT NULL,
  "reservation_reference" TEXT,
  "meter_evidence_root" TEXT,
  "settlement_reference" TEXT,
  "tolerance_wh" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "local_energy_orders_listing_fk"
    FOREIGN KEY ("listing_id") REFERENCES "local_energy_listings"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "local_energy_order_quantity_positive" CHECK ("quantity_wh" > 0),
  CONSTRAINT "local_energy_order_expected_positive" CHECK ("expected_wh" > 0),
  CONSTRAINT "local_energy_order_delivered_nonnegative" CHECK ("delivered_wh" >= 0),
  CONSTRAINT "local_energy_order_tolerance_nonnegative" CHECK ("tolerance_wh" >= 0),
  CONSTRAINT "local_energy_order_pricing_nonnegative" CHECK ("subtotal_micros" >= 0 AND "network_fee_micros" >= 0 AND "reserve_micros" >= 0 AND "total_micros" >= 0),
  CONSTRAINT "local_energy_order_idempotency_key" UNIQUE ("organization_id","idempotency_key")
);

CREATE INDEX "local_energy_orders_org_state_updated_idx"
  ON "local_energy_orders"("organization_id","state","updated_at" DESC);
CREATE INDEX "local_energy_orders_listing_state_idx"
  ON "local_energy_orders"("listing_id","state");
CREATE INDEX "local_energy_orders_buyer_state_idx"
  ON "local_energy_orders"("buyer_id","state");

CREATE TABLE "local_energy_flexibility_signals" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "grid_area_id" TEXT NOT NULL,
  "direction" "LocalEnergyFlexDirection" NOT NULL,
  "requested_wh" BIGINT NOT NULL,
  "available_wh" BIGINT NOT NULL,
  "state" "LocalEnergyFlexState" NOT NULL DEFAULT 'OPEN',
  "idempotency_key" TEXT NOT NULL,
  "starts_at" TIMESTAMP(3) NOT NULL,
  "ends_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "local_energy_flex_quantity_positive" CHECK ("requested_wh" > 0 AND "available_wh" >= 0),
  CONSTRAINT "local_energy_flex_backed" CHECK ("requested_wh" <= "available_wh"),
  CONSTRAINT "local_energy_flex_window" CHECK ("ends_at" > "starts_at"),
  CONSTRAINT "local_energy_flex_idempotency_key" UNIQUE ("organization_id","idempotency_key")
);

CREATE INDEX "local_energy_flex_org_grid_state_idx"
  ON "local_energy_flexibility_signals"("organization_id","grid_area_id","state","starts_at");

CREATE TABLE "local_energy_audit_events" (
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
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "local_energy_audit_org_created_idx"
  ON "local_energy_audit_events"("organization_id","created_at" DESC);
CREATE INDEX "local_energy_audit_action_idx"
  ON "local_energy_audit_events"("action");


CREATE TABLE "local_energy_idempotency" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "resource_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "local_energy_idempotency_org_scope_key" UNIQUE ("organization_id","scope","key")
);

CREATE INDEX "local_energy_idempotency_org_created_idx"
  ON "local_energy_idempotency"("organization_id","created_at" DESC);
