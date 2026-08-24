import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");

test("Copilot is the unified global operator interface",()=>{
  const header=read("apps/platform/src/components/header.tsx");
  const shell=read("apps/platform/src/components/shell.tsx");
  const drawer=read("apps/platform/src/components/copilot/global-copilot.tsx");
  assert.match(header,/setCopilotOpen\(true\)/);
  assert.match(shell,/GlobalCopilot/);
  assert.match(drawer,/ASK/);
  assert.match(drawer,/ANALYZE/);
  assert.match(drawer,/RESEARCH/);
  assert.match(drawer,/ACT/);
  assert.match(drawer,/contextSuggestions/);
});

test("RWA Orchestrator coordinates specialist agents and skills",()=>{
  const orchestrator=read("packages/copilot/src/orchestrator/rwa-orchestrator.ts");
  const agents=read("packages/copilot/src/agents/index.ts");
  const skills=read("packages/copilot/src/skills/index.ts");
  assert.match(orchestrator,/planCopilotRequest/);
  assert.match(orchestrator,/asset-researcher/);
  assert.match(orchestrator,/operator-agent/);
  assert.match(agents,/Asset Analyst/);
  assert.match(agents,/Risk Agent/);
  assert.match(agents,/Capital Agent/);
  assert.match(skills,/forecast-analysis/);
  assert.match(skills,/rwa-verification/);
  assert.match(skills,/workflow-planning/);
});

test("Copilot action lifecycle cannot bypass human or wallet boundaries",()=>{
  const actions=read("packages/copilot/src/actions/index.ts");
  const types=read("packages/copilot/src/types.ts");
  assert.match(types,/HUMAN_APPROVE/);
  assert.match(types,/WALLET_SIGN/);
  assert.match(actions,/COPILOT_HUMAN_APPROVAL_REQUIRED/);
  assert.match(actions,/COPILOT_EXTERNAL_WALLET_SIGNATURE_REQUIRED/);
  assert.match(actions,/COPILOT_WALLET_SIGNATURE_REQUIRED_BEFORE_RECORDING/);
});

test("Action Center is organization isolated and durable in LIVE mode",()=>{
  const store=read("apps/platform/src/lib/copilot/action-store.ts");
  const repository=read("packages/database/src/repositories/copilot.ts");
  const migration=read("packages/database/prisma/migrations/20260824000100_powerchain_copilot/migration.sql");
  assert.match(store,/organizationActions/);
  assert.match(store,/PostgresCopilotRepository/);
  assert.match(repository,/where organization_id=\$1/);
  assert.match(migration,/copilot_actions/);
  assert.match(migration,/organization_id/);
});

test("PowerChain Products exposes Copilot as a canonical product",()=>{
  const products=read("packages/data/src/application/catalog/products.ts");
  const page=read("apps/platform/src/app/products/page.tsx");
  assert.match(products,/PowerChain Copilot/);
  assert.match(products,/Renewable RWA operating intelligence/);
  assert.match(page,/POWERCHAIN_PRODUCTS/);
});

test("Legacy AI and chat routes resolve into the unified Copilot product",()=>{
  assert.match(read("apps/platform/src/app/ai/page.tsx"),/redirect\("\/copilot"\)/);
  assert.match(read("apps/platform/src/app/chat/page.tsx"),/redirect\("\/copilot"\)/);
  assert.match(read("apps/platform/src/app/dashboard/ai/agents/page.tsx"),/redirect\("\/copilot\/agents"\)/);
  assert.match(read("apps/platform/src/app/dashboard/ai/prompts/page.tsx"),/redirect\("\/copilot\/prompts"\)/);
});

test("Copilot API exposes registry, planning, run and Action Center boundaries",()=>{
  const registry=read("apps/platform/src/app/api/v1/copilot/registry/route.ts");
  const plan=read("apps/platform/src/app/api/v1/copilot/plan/route.ts");
  const run=read("apps/platform/src/app/api/v1/copilot/run/route.ts");
  assert.match(registry,/COPILOT_AGENTS/);
  assert.match(registry,/approvalChain/);
  assert.match(plan,/planCopilotRequest/);
  assert.match(run,/routeInference/);
  assert.match(run,/agentCanSign:false/);
  assert.match(run,/ACT/);
});


test("Copilot records only externally created wallet signatures",()=>{
  const store=read("apps/platform/src/lib/copilot/action-store.ts");
  const route=read("apps/platform/src/app/api/v1/copilot/actions/[id]/wallet-signature/route.ts");
  assert.match(store,/recordCopilotWalletSignature/);
  assert.match(store,/AWAITING_WALLET/);
  assert.match(store,/SIGNED_EXTERNALLY/);
  assert.match(route,/walletSignatureReference/);
  assert.doesNotMatch(route,/signTransaction/);
});

test("Copilot Agent Builder cannot enable autonomous financial or wallet execution",()=>{
  const builder=read("apps/platform/src/app/copilot/agents/builder/page.tsx");
  assert.match(builder,/Execute financial actions — disabled/);
  assert.match(builder,/Sign transactions — disabled/);
  assert.match(builder,/REQUEST_APPROVAL/);
});


test("Copilot does not claim agent analysis completed when only the safe gateway fallback ran",()=>{
  const gateway=read("packages/ai-gateway/src/index.ts");
  const run=read("apps/platform/src/app/api/v1/copilot/run/route.ts");
  const drawer=read("apps/platform/src/components/copilot/global-copilot.tsx");
  assert.match(gateway,/executionMode:"safe-fallback"/);
  assert.match(run,/status:inference\.executionMode==="provider"\?"COMPLETED"/);
  assert.match(drawer,/PLAN PREPARED/);
  assert.match(drawer,/provider\/data connector required/);
});


test("Copilot canonical architecture visual is reusable across product and architecture pages",()=>{
  const panel=read("apps/platform/src/components/copilot/copilot-architecture-panel.tsx");
  const product=read("apps/platform/src/app/copilot/page.tsx");
  const architecture=read("apps/platform/src/app/copilot/architecture/page.tsx");
  const nav=read("packages/shared/src/constants/navigation.ts");
  assert.match(panel,/powerchain-copilot-architecture\.png/);
  assert.match(panel,/CopilotArchitecturePanel/);
  assert.match(product,/CopilotArchitecturePanel/);
  assert.match(architecture,/SOURCE OF TRUTH/);
  assert.match(architecture,/AUTHORITY BOUNDARY/);
  assert.match(nav,/copilotArchitecture/);
  assert.ok(fs.existsSync("apps/platform/public/images/architectures/powerchain-copilot-architecture.png"));
});
