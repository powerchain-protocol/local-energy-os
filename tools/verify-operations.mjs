import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const required = [
  "apps/backend/prisma/schema.prisma",
  "apps/backend/prisma/migrations/001_operations/migration.sql",
  "apps/backend/src/routes/ems.ts",
  "apps/backend/src/routes/iot.ts",
  "apps/backend/src/routes/depin.ts",
  "apps/backend/src/routes/market-data.ts",
  "apps/backend/src/routes/actions.ts",
  "packages/adapters/src/auth.ts",
  "packages/adapters/src/wallet.ts",
  "packages/hooks/src/api-operations.ts",
];
for (const rel of required) if (!fs.existsSync(path.join(root, rel))) errors.push(`missing:${rel}`);
const schema = fs.readFileSync(path.join(root, "apps/backend/prisma/schema.prisma"), "utf8");
for (const model of ["SiteAccess","OperationalTelemetry","OperationalDevice","DepinNode","SafeActionIntent","PublicWalletIdentity"]) if (!schema.includes(`model ${model}`)) errors.push(`missing-model:${model}`);
const server = fs.readFileSync(path.join(root, "apps/backend/src/server.ts"), "utf8");
for (const registration of ["registerEmsRoutes","registerIotRoutes","registerDepinRoutes","registerMarketDataRoutes","registerActionRoutes"]) if (!server.includes(registration)) errors.push(`missing-route-registration:${registration}`);
const routesText = fs.readdirSync(path.join(root, "apps/backend/src/routes")).filter(n => n.endsWith(".ts")).map(n => fs.readFileSync(path.join(root,"apps/backend/src/routes",n),"utf8")).join("\n");
for (const forbidden of ["/dispatch/execute","/settlement/execute","privateKey","seedPhrase","mnemonic"]) if (routesText.includes(forbidden)) errors.push(`forbidden-execution-or-secret:${forbidden}`);
const safe = fs.readFileSync(path.join(root, "packages/safe-actions/src/index.ts"), "utf8");
for (const kind of ["ems.dispatch.prepare","iot.device.refresh","depin.node.refresh","wallet.signature.prepare","settlement.prepare"]) if (!safe.includes(kind)) errors.push(`missing-safe-action:${kind}`);
if (errors.length) { console.error(JSON.stringify({status:"failed",errors},null,2)); process.exit(1); }
console.log(JSON.stringify({status:"ok",operationsBackend:"isolated",siteAccess:true,publicWalletOnly:true,executionEndpoints:false,safeActions:5},null,2));
