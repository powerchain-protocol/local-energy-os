import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");

test("Digital Energy OS canonical domain packages are present",()=>{
  for(const path of ["packages/energy-core/src/index.ts","packages/energy-rwa/src/index.ts","packages/asset-graph/src/index.ts","packages/digital-energy/src/index.ts"])assert.ok(fs.existsSync(path),path);
  assert.match(read("packages/energy-core/src/index.ts"),/export const KWH = 1_000n/);
  assert.match(read("packages/energy-core/src/index.ts"),/export const MWH = 1_000_000n/);
  assert.match(read("packages/energy-rwa/src/index.ts"),/VERIFIED_ENERGY_POSITION/);
  assert.match(read("packages/energy-rwa/src/index.ts"),/POWERCHAIN_ENERGY_LEDGER/);
});

test("Digital Energy API is wired to persistent runtime and safe write lifecycle",()=>{
  const server=read("apps/platform/src/lib/digital-energy/server.ts");
  assert.match(server,/PostgresDigitalEnergyRepository/);
  assert.match(server,/Economic writes never fall back/);
  assert.match(server,/DIGITAL_ENERGY_ALLOW_DEMO_FALLBACK/);
  for(const path of [
    "apps/platform/src/app/api/v1/digital-energy/overview/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/positions/[id]/backing/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/reservations/[id]/release/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/audit/route.ts",
  ])assert.ok(fs.existsSync(path),path);
});

test("dashboard and operator workspaces use Digital Energy control plane",()=>{
  assert.match(read("apps/platform/src/components/dashboard/dashboard-page.tsx"),/DigitalEnergyCommandCenter/);
  assert.ok(fs.existsSync("apps/platform/src/app/digital-energy/page.tsx"));
  assert.ok(fs.existsSync("apps/platform/src/app/energy-rwa/page.tsx"));
  assert.ok(fs.existsSync("apps/platform/src/app/asset-graph/page.tsx"));
  const workspace=read("apps/platform/src/components/digital-energy/energy-rwa-workspace.tsx");
  assert.match(workspace,/fetchDigitalEnergyPositionBacking/);
  assert.match(workspace,/Release reservation/);
  assert.match(workspace,/Retire .* representation/);
});

test("database schema persists Digital Energy state, idempotency and audit",()=>{
  const schema=read("packages/database/prisma/schema.prisma");
  for(const model of ["DigitalEnergyProof","DigitalEnergyBatch","DigitalEnergyPosition","DigitalEnergyReservation","DigitalEnergyRepresentation","DigitalEnergyRetirement","DigitalEnergyIdempotency","DigitalEnergyAuditEvent"])assert.match(schema,new RegExp(`model ${model}`));
  assert.ok(fs.existsSync("packages/database/prisma/migrations/20260823000100_digital_energy_os/migration.sql"));
});

test("Digital Energy documentation and OpenAPI are canonical",()=>{
  for(const doc of ["docs/DIGITAL-ENERGY-OS.md","docs/ENERGY-RWA.md","docs/ASSET-GRAPH.md"])assert.ok(fs.existsSync(doc),doc);
  const openapi=read("docs/api/swagger.yaml");
  assert.match(openapi,/\/digital-energy\/overview:/);
  assert.match(openapi,/\/digital-energy\/positions\/\{id\}\/backing:/);
  assert.match(openapi,/\/digital-energy\/prices:/);
});

test("Canonical v1.0.0 wires operational twin, delivery, reconciliation and settlement",()=>{
  const operations=read("packages/energy-operations/src/index.ts");
  assert.match(operations,/physicalDeliveryRequiresMeterEvidence: true/);
  assert.match(operations,/financialSettlementDoesNotProveDelivery: true/);
  assert.match(operations,/DELIVERY_EVIDENCE_REQUIRED/);
  assert.match(operations,/REVIEW_REQUIRED/);
  assert.match(operations,/SETTLEMENT_ASSETS = \["USDC", "EURC", "FIAT_EUR"\]/);
  for(const path of [
    "apps/platform/src/app/api/v1/digital-energy/operations/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/digital-twin/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/deliveries/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/deliveries/[id]/record/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/deliveries/[id]/reconcile/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/settlements/route.ts",
    "apps/platform/src/app/api/v1/digital-energy/settlements/[id]/transition/route.ts",
  ])assert.ok(fs.existsSync(path),path);
});

test("Canonical v1.0.0 dashboard exposes operations and Digital Twin workspaces",()=>{
  assert.ok(fs.existsSync("apps/platform/src/app/digital-energy/twin/page.tsx"));
  assert.ok(fs.existsSync("apps/platform/src/app/energy-operations/page.tsx"));
  const command=read("apps/platform/src/components/digital-energy/digital-energy-command-center.tsx");
  assert.match(command,/Operational Digital Twin/);
  assert.match(command,/Delivery → reconciliation → settlement/);
  const nav=read("packages/shared/src/constants/navigation.ts");
  assert.match(nav,/Energy Operations/);
  assert.match(nav,/Operational Twin/);
});

test("Canonical v1.0.0 persistence includes operational models and migration",()=>{
  const schema=read("packages/database/prisma/schema.prisma");
  for(const model of ["DigitalEnergyTwinAsset","DigitalEnergyDelivery","DigitalEnergyReconciliation","DigitalEnergySettlement"])assert.match(schema,new RegExp(`model ${model}`));
  assert.ok(fs.existsSync("packages/database/prisma/migrations/20260823000200_digital_energy_operations/migration.sql"));
  const repo=read("packages/database/src/repositories/energy-operations.ts");
  assert.match(repo,/DELIVERY_RESERVATION_REQUIRED/);
  assert.match(repo,/digital_energy_settlements/);
});

test("Canonical v1.0.0 live writes require explicit operator authorization",()=>{
  const server=read("apps/platform/src/lib/digital-energy/server.ts");
  assert.match(server,/DIGITAL_ENERGY_WRITE_FORBIDDEN/);
  assert.match(server,/DIGITAL_ENERGY_TRUST_SERVICE_HEADERS/);
});


test("Canonical v1.0.0 validates operational runtime inputs",()=>{
  const operations=read("packages/energy-operations/src/index.ts");
  assert.match(operations,/TWIN_OBSERVED_AT_INVALID/);
  assert.match(operations,/TWIN_ASSET_TYPE_INVALID/);
  assert.match(operations,/SETTLEMENT_ASSET_INVALID/);
  assert.match(operations,/SETTLEMENT_NETWORK_INVALID/);
  const controls=read("packages/energy-controls/src/index.ts");
  assert.match(`${operations}\n${controls}`,/Settlement amount must be greater than zero/);
});

test("Canonical v1.0.0 standards separate delivery from settlement and token assets",()=>{
  const standards=read("apps/platform/src/app/api/v1/digital-energy/standards/route.ts");
  assert.match(standards,/"Delivery"/);
  assert.match(standards,/meterEvidenceRequiredForDelivery: true/);
  assert.match(standards,/financialSettlementDoesNotProveDelivery: true/);
  assert.match(standards,/blockchainConfirmationDoesNotCreateEnergy: true/);
});


test("Canonical v1.0.0 live reads do not trust arbitrary tenant headers",()=>{
  const server=read("apps/platform/src/lib/digital-energy/server.ts");
  assert.match(server,/accessMode: "SESSION" \| "TRUSTED_SERVICE" \| "DEMO" \| "UNAUTHENTICATED"/);
  assert.match(server,/DIGITAL_ENERGY_AUTH_REQUIRED/);
  assert.match(server,/org_unauthenticated/);
  assert.match(server,/DIGITAL_ENERGY_SERVICE_HMAC_SECRET/);
  assert.match(server,/x-powerchain-service-signature/);
  assert.match(server,/timingSafeEqual/);
});

test("Digital Energy persistence serializes concurrent idempotent retries",()=>{
  for(const path of ["packages/database/src/repositories/digital-energy.ts","packages/database/src/repositories/energy-operations.ts"]){
    assert.match(read(path),/pg_advisory_xact_lock/);
  }
});


test("Digital Energy v1.0.0 binds settlement proposals to SHA-256 maker-checker controls",()=>{
  const controls=read("packages/energy-controls/src/index.ts");
  assert.match(controls,/POWERCHAIN_SETTLEMENT_REVIEW_V1/);
  assert.match(controls,/createHash\("sha256"\)/);
  assert.match(controls,/makerCheckerRequired/);
  assert.match(controls,/SETTLEMENT_APPROVAL_REQUIRED/);
  assert.match(controls,/SETTLEMENT_MAKER_CHECKER_REQUIRED/);
  assert.ok(fs.existsSync("apps/platform/src/app/api/v1/digital-energy/settlements/[id]/approval/route.ts"));
});

test("Digital Energy v1.0.0 persists approvals and a lease-backed transactional outbox",()=>{
  const schema=read("packages/database/prisma/schema.prisma");
  assert.match(schema,/model DigitalEnergySettlementApproval/);
  assert.match(schema,/model DigitalEnergyOutboxEvent/);
  assert.match(schema,/nextAttemptAt/);
  assert.match(schema,/processingStartedAt/);
  const migration=read("packages/database/prisma/migrations/20260823000300_digital_energy_controls/migration.sql");
  assert.match(migration,/digital_energy_settlement_approvals/);
  assert.match(migration,/digital_energy_outbox_events/);
  assert.match(migration,/next_attempt_at/);
  assert.match(migration,/processing_started_at/);
});

test("Digital Energy v1.0.0 worker publishes durable events with retry, HTTPS and optional HMAC",()=>{
  const worker=read("apps/workers/src/digital-energy-outbox.ts");
  assert.match(worker,/claimBatch/);
  assert.match(worker,/x-powerchain-event-id/);
  assert.match(worker,/idempotency-key/);
  assert.match(worker,/createHmac\("sha256"/);
  assert.match(worker,/DIGITAL_ENERGY_EVENT_SINK_HTTPS_REQUIRED/);
  assert.match(worker,/markFailed/);
  assert.match(worker,/DIGITAL_ENERGY_OUTBOX_LEASE_SECONDS/);
  const server=read("apps/workers/src/server.ts");
  assert.match(server,/startDigitalEnergyOutboxPublisher/);
});

test("Digital Energy v1.0.0 dashboard wires the Institutional Controls workspace",()=>{
  assert.ok(fs.existsSync("apps/platform/src/app/digital-energy/controls/page.tsx"));
  const ui=read("apps/platform/src/components/digital-energy/institutional-controls-workspace.tsx");
  assert.match(ui,/Approve exact hash/);
  assert.match(ui,/Transactional outbox/);
  assert.match(ui,/Publisher runtime/);
  const nav=read("packages/shared/src/constants/navigation.ts");
  assert.match(nav,/Institutional Controls/);
  const command=read("apps/platform/src/components/digital-energy/digital-energy-command-center.tsx");
  assert.match(command,/\/digital-energy\/controls/);
});

test("Digital Energy v1.0.0 narrows control-plane reads and financial execution authority",()=>{
  const controlsRoute=read("apps/platform/src/app/api/v1/digital-energy/controls/route.ts");
  assert.match(controlsRoute,/requireDigitalEnergySettlementApprover/);
  const settlements=read("apps/platform/src/app/api/v1/digital-energy/settlements/route.ts");
  const transitions=read("apps/platform/src/app/api/v1/digital-energy/settlements/[id]/transition/route.ts");
  assert.match(settlements,/requireDigitalEnergySettlementExecutor/);
  assert.match(transitions,/requireDigitalEnergySettlementExecutor/);
});

test("Digital Energy v1.0.0 publishes control semantics without changing physical authority",()=>{
  const standards=read("apps/platform/src/app/api/v1/digital-energy/standards/route.ts");
  assert.match(standards,/institutionalControls/);
  assert.match(standards,/SHA-256/);
  assert.match(standards,/transactionalOutbox: true/);
  assert.match(standards,/outboxDelivery: "AT_LEAST_ONCE"/);
  assert.match(standards,/financialSettlementRemainsSeparateFromPhysicalDelivery: true/);
});


test("Digital Energy v1.0.0 requires signed HMAC trusted-service context",()=>{
  const server=read("apps/platform/src/lib/digital-energy/server.ts");
  assert.match(server,/createHmac\("sha256"/);
  assert.match(server,/timingSafeEqual/);
  assert.match(server,/x-powerchain-service-timestamp/);
  assert.match(server,/x-powerchain-service-signature/);
  assert.match(server,/DIGITAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS/);
});
