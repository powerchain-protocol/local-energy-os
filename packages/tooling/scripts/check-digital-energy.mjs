import fs from "node:fs";

const required=[
  "packages/energy-core/src/index.ts",
  "packages/energy-rwa/src/index.ts",
  "packages/asset-graph/src/index.ts",
  "packages/digital-energy/src/index.ts",
  "packages/energy-operations/src/index.ts",
  "packages/energy-controls/src/index.ts",
  "packages/energy-controls/package.json",
  "packages/database/src/repositories/digital-energy.ts",
  "packages/database/src/repositories/energy-operations.ts",
  "packages/database/src/repositories/energy-outbox-worker.ts",
  "packages/database/prisma/migrations/20260823000100_digital_energy_os/migration.sql",
  "packages/database/prisma/migrations/20260823000200_digital_energy_operations/migration.sql",
  "packages/database/prisma/migrations/20260823000300_digital_energy_controls/migration.sql",
  "apps/platform/src/lib/digital-energy/server.ts",
  "apps/platform/src/lib/digital-energy/operations-server.ts",
  "apps/platform/src/components/digital-energy/digital-energy-command-center.tsx",
  "apps/platform/src/components/digital-energy/digital-twin-workspace.tsx",
  "apps/platform/src/components/digital-energy/energy-operations-workspace.tsx",
  "apps/platform/src/components/digital-energy/institutional-controls-workspace.tsx",
  "apps/platform/src/components/digital-energy/energy-rwa-workspace.tsx",
  "apps/platform/src/app/digital-energy/controls/page.tsx",
  "apps/platform/src/app/api/v1/digital-energy/overview/route.ts",
  "apps/platform/src/app/api/v1/digital-energy/controls/route.ts",
  "apps/platform/src/app/api/v1/digital-energy/settlements/[id]/approval/route.ts",
  "apps/workers/src/digital-energy-outbox.ts",
  "docs/DIGITAL-ENERGY-OS.md",
  "docs/DIGITAL-ENERGY-OPERATIONS.md",
  "docs/DIGITAL-ENERGY-CONTROLS.md",
  "docs/ENERGY-RWA.md",
  "docs/ASSET-GRAPH.md",
  "docs/IMPROVEMENTS.md",
];

const errors=[];
for(const path of required)if(!fs.existsSync(path))errors.push(`Missing ${path}`);

const energyRwa=fs.readFileSync("packages/energy-rwa/src/index.ts","utf8");
if(!energyRwa.includes("VERIFIED_ENERGY_POSITION")||!energyRwa.includes("POWERCHAIN_ENERGY_LEDGER")){
  errors.push("PET-20 canonical metadata contract missing");
}

const server=fs.readFileSync("apps/platform/src/lib/digital-energy/server.ts","utf8");
if(!server.includes("PostgresDigitalEnergyRepository"))errors.push("Persistent Digital Energy runtime not wired");
if(!server.includes("Economic writes never fall back"))errors.push("Fail-closed LIVE write policy missing");
if(!server.includes("DIGITAL_ENERGY_WRITE_FORBIDDEN"))errors.push("LIVE Digital Energy write authorization boundary missing");
if(!server.includes("requireDigitalEnergySettlementApprover"))errors.push("Settlement checker authorization boundary missing");
if(!server.includes("requireDigitalEnergySettlementExecutor"))errors.push("Settlement execution authorization boundary missing");

const operations=fs.readFileSync("packages/energy-operations/src/index.ts","utf8");
if(!operations.includes("physicalDeliveryRequiresMeterEvidence")||!operations.includes("financialSettlementDoesNotProveDelivery")){
  errors.push("Delivery/settlement authority boundary missing");
}
if(!operations.includes("DELIVERY_EVIDENCE_REQUIRED")||!operations.includes("REVIEW_REQUIRED")){
  errors.push("Delivery evidence or reconciliation safeguards missing");
}
if(!operations.includes("approveSettlement")||!operations.includes("assertSettlementCanSubmit")){
  errors.push("Settlement approval lifecycle is not wired into Energy Operations");
}

const controls=fs.readFileSync("packages/energy-controls/src/index.ts","utf8");
if(!controls.includes("POWERCHAIN_SETTLEMENT_REVIEW_V1")||!controls.includes('createHash("sha256")')){
  errors.push("SHA-256 settlement review contract missing");
}
if(!controls.includes("makerCheckerRequired")||!controls.includes("SETTLEMENT_APPROVAL_REQUIRED")){
  errors.push("Maker-checker policy missing");
}

const repository=fs.readFileSync("packages/database/src/repositories/energy-operations.ts","utf8");
for(const requiredToken of [
  "pg_advisory_xact_lock",
  "digital_energy_settlement_approvals",
  "digital_energy_outbox_events",
  "FOR UPDATE".toLowerCase(),
]) {
  if(!repository.toLowerCase().includes(requiredToken.toLowerCase()))errors.push(`Database controls missing ${requiredToken}`);
}
if(!repository.includes("enqueueOutbox"))errors.push("Transactional outbox write boundary missing");
if(!repository.includes("processing_started_at")||!repository.includes("next_attempt_at"))errors.push("Outbox lease/retry persistence is not wired");

const worker=fs.readFileSync("apps/workers/src/digital-energy-outbox.ts","utf8");
for(const token of [
  "x-powerchain-event-id",
  "idempotency-key",
  "createHmac",
  "DIGITAL_ENERGY_EVENT_SINK_HTTPS_REQUIRED",
  "DIGITAL_ENERGY_OUTBOX_LEASE_SECONDS",
  "markFailed",
]){
  if(!worker.includes(token))errors.push(`Outbox publisher missing ${token}`);
}

const migration=fs.readFileSync("packages/database/prisma/migrations/20260823000300_digital_energy_controls/migration.sql","utf8");
for(const token of ["digital_energy_settlement_approvals","digital_energy_outbox_events","next_attempt_at","processing_started_at"]){
  if(!migration.includes(token))errors.push(`Controls migration missing ${token}`);
}

const controlsRoute=fs.readFileSync("apps/platform/src/app/api/v1/digital-energy/controls/route.ts","utf8");
if(!controlsRoute.includes("requireDigitalEnergySettlementApprover"))errors.push("Controls read authorization missing");
if(!controlsRoute.includes("getDigitalEnergyOutboxPublisherHealth"))errors.push("Truthful publisher-health boundary missing");

const approvalRoute=fs.readFileSync("apps/platform/src/app/api/v1/digital-energy/settlements/[id]/approval/route.ts","utf8");
if(!approvalRoute.includes("64-character SHA-256"))errors.push("Approval review-hash validation missing");

const controlsUi=fs.readFileSync("apps/platform/src/components/digital-energy/institutional-controls-workspace.tsx","utf8");
if(!controlsUi.includes("Approve exact hash")||!controlsUi.includes("Transactional outbox")||!controlsUi.includes("Publisher runtime")){
  errors.push("Institutional Controls dashboard is incomplete");
}

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("PowerChain Digital Energy OS v1.0.0 canonical check passed.");
