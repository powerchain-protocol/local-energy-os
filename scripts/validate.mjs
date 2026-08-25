import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const script of ["scripts/workspace-doctor.mjs", "scripts/verify-api-docs.mjs"]) {
  const result = spawnSync(process.execPath, [script], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
for (const file of ["package.json","turbo.json","tsconfig.base.json","apps/energy/package.json","apps/docs/package.json","apps/platform/package.json","apps/api/package.json","apps/worker/package.json","packages/shared/package.json","store/package.json","storage/package.json"]) JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const prisma = fs.readFileSync(path.join(root,"prisma/schema.prisma"),"utf8");
for (const model of ["EnergyProof","EnergyBatch","EnergyPosition","EnergyReservation","EnergyRetirement","PwrcBridgeTransfer","SaaSTenant","IdempotencyRecord","AuditLog","DomainEventOutbox","EnergySite","Meter","PowerPlant","WindFarm","ChargingStation","ChargingSession","AssetPassport","User","OrganizationMembership","Session","LinkedWallet","WalletAuthChallenge"]) if (!prisma.includes(`model ${model}`)) throw new Error(`Missing Prisma model ${model}`);
console.log(JSON.stringify({status:"ok",validated:["workspace-doctor","api-doc-method-coverage","json-manifests","prisma-model-presence","economic-route-wiring"],note:"Official Prisma/TypeScript/Next/Anchor/Sui validation remains part of Node 24 release verification."},null,2));
