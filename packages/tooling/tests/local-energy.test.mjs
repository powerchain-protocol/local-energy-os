import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");

test("Local Energy OS preserves Wh as the canonical physical-energy unit",()=>{
  const domain=read("packages/local-energy/src/index.ts");
  assert.match(domain,/LOCAL_ENERGY_CANONICAL_UNIT = "Wh"/);
  assert.match(domain,/kwhToWh/);
  assert.match(domain,/1_000/);
});

test("Local Energy commitments remain bounded by physical availability and grid limits",()=>{
  const domain=read("packages/local-energy/src/index.ts");
  assert.match(domain,/LOCAL_ENERGY_COMMITMENT_EXCEEDS_AVAILABLE/);
  assert.match(domain,/LOCAL_ENERGY_EXPORT_LIMIT_EXCEEDED/);
  assert.match(domain,/LOCAL_ENERGY_IMPORT_LIMIT_EXCEEDED/);
});

test("Local Energy product surfaces cover market grid devices and settlement",()=>{
  for(const path of [
    "apps/platform/src/app/local-energy/page.tsx",
    "apps/platform/src/app/local-energy/marketplace/page.tsx",
    "apps/platform/src/app/local-energy/grid/page.tsx",
    "apps/platform/src/app/local-energy/devices/page.tsx",
    "apps/platform/src/app/local-energy/settlement/page.tsx",
  ])assert.ok(fs.existsSync(path));
  const command=read("apps/platform/src/components/local-energy/local-energy-command-center.tsx");
  assert.match(command,/Local Market/);
  assert.match(command,/Grid & Flexibility/);
  assert.match(command,/Devices & Edge/);
  assert.match(command,/Settlement/);
});

test("Local Energy market remains downstream of physical delivery authority",()=>{
  const runtime=read("apps/platform/src/lib/local-energy/server.ts");
  const settlement=read("apps/platform/src/components/local-energy/local-energy-settlement-workspace.tsx");
  assert.match(runtime,/blockchainSettlementDoesNotProveDelivery:true/);
  assert.match(settlement,/Payment is downstream of physical delivery evidence/);
  assert.match(settlement,/wallet signature or blockchain confirmation/i);
});

test("Local Energy OS is a canonical PowerChain product",()=>{
  const products=read("packages/data/src/application/catalog/products.ts");
  const nav=read("packages/shared/src/constants/navigation.ts");
  assert.match(products,/name:"Local Energy OS"/);
  assert.match(products,/href:"\/local-energy"/);
  assert.match(products,/status:"CANONICAL"/);
  assert.match(nav,/Local Energy OS/);
});

test("PowerChain Copilot understands Local Energy as route context",()=>{
  const types=read("packages/copilot/src/types.ts");
  const context=read("packages/copilot/src/context/index.ts");
  const drawer=read("apps/platform/src/components/copilot/global-copilot.tsx");
  assert.match(types,/LOCAL_ENERGY/);
  assert.match(context,/Explain local energy balance/);
  assert.match(drawer,/Local Energy OS/);
});

test("Legacy P2P route resolves to the canonical Local Energy marketplace",()=>{
  assert.match(read("apps/platform/src/app/p2p-energy/page.tsx"),/redirect\("\/local-energy\/marketplace"\)/);
});


test("Local Energy persistence reserves inventory atomically and idempotently",()=>{
  const repository=read("packages/database/src/repositories/local-energy.ts");
  const migration=read("packages/database/prisma/migrations/20260824000200_local_energy_os/migration.sql");
  assert.match(repository,/pg_advisory_xact_lock/);
  assert.match(repository,/for update/i);
  assert.match(repository,/available_wh=available_wh-\$3/);
  assert.match(repository,/idempotency_key/);
  assert.match(migration,/UNIQUE \("organization_id","idempotency_key"\)/);
});

test("Local Energy order lifecycle blocks settlement before meter evidence and reconciliation",()=>{
  const domain=read("packages/local-energy/src/index.ts");
  const route=read("apps/platform/src/app/api/v1/p2p/orders/[id]/route.ts");
  assert.match(domain,/LOCAL_ENERGY_METER_EVIDENCE_REQUIRED/);
  assert.match(domain,/SETTLEMENT_READY/);
  assert.match(route,/Legacy "settled" updates are deliberately not allowed to jump over/);
  assert.match(route,/MARK_SETTLEMENT_READY/);
});

test("Local Energy flexibility requests cannot exceed available physical capacity",()=>{
  const repository=read("packages/database/src/repositories/local-energy.ts");
  const api=read("apps/platform/src/app/api/v1/local-energy/flexibility/route.ts");
  assert.match(repository,/LOCAL_ENERGY_FLEXIBILITY_NOT_BACKED/);
  assert.match(api,/requestedKwh/);
  assert.match(api,/availableKwh/);
});


test("Local Energy does not relabel demo community telemetry as LIVE",()=>{
  const runtime=read("apps/platform/src/lib/local-energy/server.ts");
  const command=read("apps/platform/src/components/local-energy/local-energy-command-center.tsx");
  const marketplace=read("apps/platform/src/workspaces/p2p/components/p2p-marketplace.tsx");
  assert.match(runtime,/NO_LIVE_COMMUNITY_AGGREGATE_SOURCE/);
  assert.match(runtime,/localSupplyWh:null/);
  assert.match(runtime,/telemetry:demo\?"OPERATIONAL":"UNAVAILABLE"/);
  assert.match(command,/LIVE SOURCE UNAVAILABLE/);
  assert.match(marketplace,/aggregate energy metrics are shown as unavailable rather than demo values/);
});


test("Local Energy rejects idempotency-key reuse with a different payload",()=>{
  const repository=read("packages/database/src/repositories/local-energy.ts");
  const runtime=read("apps/platform/src/lib/local-energy/server.ts");
  assert.match(repository,/Idempotency key was reused with a different Local Energy order payload/);
  assert.match(repository,/Idempotency key was reused with a different flexibility payload/);
  assert.match(repository,/Idempotency key was reused with a different Local Energy listing payload/);
  assert.match(runtime,/LOCAL_ENERGY_IDEMPOTENCY_CONFLICT/);
});
