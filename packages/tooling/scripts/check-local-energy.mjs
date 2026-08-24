import fs from "node:fs";

const required=[
  "packages/local-energy/package.json",
  "packages/local-energy/src/index.ts",
  "apps/platform/src/components/local-energy/local-energy-command-center.tsx",
  "apps/platform/src/app/local-energy/page.tsx",
  "apps/platform/src/app/local-energy/marketplace/page.tsx",
  "apps/platform/src/app/local-energy/grid/page.tsx",
  "apps/platform/src/app/local-energy/devices/page.tsx",
  "apps/platform/src/app/local-energy/settlement/page.tsx",
  "apps/platform/src/app/api/v1/local-energy/overview/route.ts",
  "docs/LOCAL-ENERGY-OS.md",
];

const errors=[];
for(const path of required)if(!fs.existsSync(path))errors.push(`Missing ${path}`);

const domain=fs.readFileSync("packages/local-energy/src/index.ts","utf8");
for(const token of [
  'LOCAL_ENERGY_CANONICAL_UNIT = "Wh"',
  "PROSUMER",
  "GRID_OPERATOR",
  "assertGridConstrainedCommitment",
  "LOCAL_ENERGY_EXPORT_LIMIT_EXCEEDED",
  "MEASURE",
  "REWARD",
]){
  if(!domain.includes(token))errors.push(`Local Energy domain contract missing: ${token}`);
}

const overview=fs.readFileSync("apps/platform/src/lib/local-energy/server.ts","utf8");
for(const token of [
  "physicalEnergyAuthoritative:true",
  "blockchainSettlementDoesNotProveDelivery:true",
  "batteryDischargeCreatesNoNewRenewableProvenance:true",
  "canonicalUnit",
]){
  if(!overview.includes(token))errors.push(`Local Energy overview authority contract missing: ${token}`);
}

const runtime=fs.readFileSync("apps/platform/src/lib/local-energy/server.ts","utf8");
const repository=fs.readFileSync("packages/database/src/repositories/local-energy.ts","utf8");
const migration=fs.readFileSync("packages/database/prisma/migrations/20260824000200_local_energy_os/migration.sql","utf8");
if(!runtime.includes("PostgresLocalEnergyRepository"))errors.push("Persistent Local Energy runtime not wired");
if(!runtime.includes("Idempotency-Key"))errors.push("Local Energy idempotency contract missing");
if(!runtime.includes("NO_LIVE_COMMUNITY_AGGREGATE_SOURCE")||!runtime.includes('telemetry:demo?"OPERATIONAL":"UNAVAILABLE"'))errors.push("Truthful LIVE Local Energy aggregate-data state missing");
for(const token of ["pg_advisory_xact_lock","for update","available_wh=available_wh-$3","LOCAL_ENERGY_METER_EVIDENCE_REQUIRED","LOCAL_ENERGY_ORDER_CONFLICT"]){
  if(!repository.toLowerCase().includes(token.toLowerCase()))errors.push(`Local Energy repository safeguard missing: ${token}`);
}
for(const token of ["local_energy_orders","local_energy_flexibility_signals","local_energy_audit_events","quantity_wh","meter_evidence_root"]){
  if(!migration.includes(token))errors.push(`Local Energy migration missing: ${token}`);
}

const command=fs.readFileSync("apps/platform/src/components/local-energy/local-energy-command-center.tsx","utf8");
for(const token of ["LOCAL ENERGY OS","Local Market","Grid & Flexibility","Devices & Edge","Settlement","CANONICAL ENERGY FLOW","SYSTEM BOUNDARY"]){
  if(!command.includes(token))errors.push(`Local Energy command center missing: ${token}`);
}
if(!command.includes("setCopilotOpen(true)"))errors.push("Local Energy contextual Copilot entry missing");

const legacy=fs.readFileSync("apps/platform/src/app/p2p-energy/page.tsx","utf8");
if(!legacy.includes('redirect("/local-energy/marketplace")'))errors.push("Legacy P2P route does not redirect to canonical Local Energy marketplace");

const products=fs.readFileSync("packages/data/src/application/catalog/products.ts","utf8");
if(!products.includes('name:"Local Energy OS"')||!products.includes('href:"/local-energy"')||!products.includes('status:"CANONICAL"')){
  errors.push("Local Energy OS is not a canonical PowerChain product");
}

const copilotTypes=fs.readFileSync("packages/copilot/src/types.ts","utf8");
const copilotContext=fs.readFileSync("packages/copilot/src/context/index.ts","utf8");
const copilotDrawer=fs.readFileSync("apps/platform/src/components/copilot/global-copilot.tsx","utf8");
if(!copilotTypes.includes('"LOCAL_ENERGY"'))errors.push("Copilot LOCAL_ENERGY context type missing");
if(!copilotContext.includes('case "LOCAL_ENERGY"'))errors.push("Copilot Local Energy suggestions missing");
if(!copilotDrawer.includes('pathname.startsWith("/local-energy")'))errors.push("Copilot Local Energy route context missing");

const openapi=fs.readFileSync("docs/api/swagger.yaml","utf8");
if(!openapi.includes("/local-energy/overview:")||!openapi.includes("tags: [Local Energy]"))errors.push("Local Energy OpenAPI missing");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("PowerChain Local Energy OS v1.0.0 canonical check passed.");
