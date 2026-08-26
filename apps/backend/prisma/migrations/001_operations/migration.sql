CREATE SCHEMA IF NOT EXISTS "operations";

CREATE TABLE IF NOT EXISTS "operations"."site_access" (
  "id" TEXT PRIMARY KEY,
  "actor_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'VIEWER',
  "can_read" BOOLEAN NOT NULL DEFAULT TRUE,
  "can_prepare_actions" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_access_actor_org_site_key" ON "operations"."site_access"("actor_id","organization_id","site_id");
CREATE INDEX IF NOT EXISTS "site_access_org_site_active_idx" ON "operations"."site_access"("organization_id","site_id","active");

CREATE TABLE IF NOT EXISTS "operations"."operational_telemetry" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" DECIMAL(30,9) NOT NULL,
  "unit" TEXT NOT NULL,
  "mode" TEXT NOT NULL DEFAULT 'LIVE',
  "quality" TEXT NOT NULL DEFAULT 'VALID',
  "interval_ms" INTEGER NOT NULL,
  "observed_at" TIMESTAMP(3) NOT NULL,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "operational_telemetry_lookup_idx" ON "operations"."operational_telemetry"("organization_id","site_id","metric","observed_at" DESC);

CREATE TABLE IF NOT EXISTS "operations"."operational_devices" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "vendor" TEXT,
  "model" TEXT,
  "serial_number" TEXT,
  "connection_state" TEXT NOT NULL DEFAULT 'UNCONFIGURED',
  "last_seen_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "operational_devices_org_site_state_idx" ON "operations"."operational_devices"("organization_id","site_id","connection_state");

CREATE TABLE IF NOT EXISTS "operations"."depin_nodes" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT,
  "network" TEXT NOT NULL,
  "operator_id" TEXT NOT NULL,
  "location_ref" TEXT,
  "capabilities" JSONB NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  "last_seen_at" TIMESTAMP(3),
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "depin_nodes_org_site_state_idx" ON "operations"."depin_nodes"("organization_id","site_id","state");

CREATE TABLE IF NOT EXISTS "operations"."depin_heartbeats" (
  "id" TEXT PRIMARY KEY,
  "node_id" TEXT NOT NULL,
  "observed_at" TIMESTAMP(3) NOT NULL,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB
);
CREATE INDEX IF NOT EXISTS "depin_heartbeats_node_observed_idx" ON "operations"."depin_heartbeats"("node_id","observed_at" DESC);

CREATE TABLE IF NOT EXISTS "operations"."public_wallet_identities" (
  "id" TEXT PRIMARY KEY,
  "actor_id" TEXT NOT NULL,
  "organization_id" TEXT NOT NULL,
  "chain" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "label" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "public_wallet_identities_chain_address_key" ON "operations"."public_wallet_identities"("chain","address");
CREATE INDEX IF NOT EXISTS "public_wallet_identities_actor_org_primary_idx" ON "operations"."public_wallet_identities"("actor_id","organization_id","is_primary");

CREATE TABLE IF NOT EXISTS "operations"."safe_action_intents" (
  "id" TEXT PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "site_id" TEXT,
  "actor_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "disposition" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'PREPARED',
  "idempotency_key" TEXT NOT NULL,
  "request" JSONB NOT NULL,
  "requires_review" BOOLEAN NOT NULL DEFAULT FALSE,
  "requires_wallet_signature" BOOLEAN NOT NULL DEFAULT FALSE,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "safe_action_intents_org_idempotency_key" ON "operations"."safe_action_intents"("organization_id","idempotency_key");
CREATE INDEX IF NOT EXISTS "safe_action_intents_org_site_created_idx" ON "operations"."safe_action_intents"("organization_id","site_id","created_at" DESC);
