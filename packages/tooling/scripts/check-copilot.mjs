import fs from "node:fs";

const required = [
  "packages/copilot/package.json",
  "packages/copilot/src/index.ts",
  "packages/copilot/src/types.ts",
  "packages/copilot/src/orchestrator/rwa-orchestrator.ts",
  "packages/copilot/src/agents/index.ts",
  "packages/copilot/src/skills/index.ts",
  "packages/copilot/src/prompts/index.ts",
  "packages/copilot/src/actions/index.ts",
  "apps/platform/src/components/copilot/global-copilot.tsx",
  "apps/platform/public/images/architectures/powerchain-copilot-architecture.png",
  "apps/platform/src/app/copilot/architecture/page.tsx",
  "apps/platform/src/components/copilot/copilot-architecture-panel.tsx",
  "apps/platform/src/components/copilot/action-center-workspace.tsx",
  "apps/platform/src/app/copilot/page.tsx",
  "apps/platform/src/app/copilot/action-center/page.tsx",
  "apps/platform/src/app/copilot/agents/page.tsx",
  "apps/platform/src/app/copilot/skills/page.tsx",
  "apps/platform/src/app/copilot/prompts/page.tsx",
  "apps/platform/src/app/copilot/settings/page.tsx",
  "apps/platform/src/app/products/page.tsx",
  "apps/platform/src/app/api/v1/copilot/registry/route.ts",
  "apps/platform/src/app/api/v1/copilot/plan/route.ts",
  "apps/platform/src/app/api/v1/copilot/run/route.ts",
  "apps/platform/src/app/api/v1/copilot/actions/route.ts",
  "apps/platform/src/app/api/v1/copilot/actions/[id]/approve/route.ts",
  "apps/platform/src/app/api/v1/copilot/actions/[id]/reject/route.ts",
  "apps/platform/src/app/api/v1/copilot/actions/[id]/wallet-signature/route.ts",
  "apps/platform/src/app/copilot/agents/builder/page.tsx",
  "packages/database/src/repositories/copilot.ts",
  "packages/database/prisma/migrations/20260824000100_powerchain_copilot/migration.sql",
  "docs/POWERCHAIN-COPILOT.md",
  "docs/PRODUCTS.md",
];

const errors=[];
for(const path of required) if(!fs.existsSync(path)) errors.push(`Missing ${path}`);

const orchestrator=fs.readFileSync("packages/copilot/src/orchestrator/rwa-orchestrator.ts","utf8");
if(!orchestrator.includes("planCopilotRequest")||!orchestrator.includes("RWA")&&!orchestrator.includes("requiresHumanApproval")) errors.push("RWA Orchestrator contract missing");
if(!orchestrator.includes("NO_AGENT_WALLET_SIGNATURE")) errors.push("Agent wallet-sign prohibition missing");

const agents=fs.readFileSync("packages/copilot/src/agents/index.ts","utf8");
for(const name of ["Asset Researcher","Asset Analyst","Risk Agent","Capital Agent","Operator Agent","Verification Agent","Document Intelligence Agent","Reporting Agent","Impact Agent","Launch Agent"]){
  if(!agents.includes(name)) errors.push(`Copilot agent missing: ${name}`);
}

const skills=fs.readFileSync("packages/copilot/src/skills/index.ts","utf8");
for(const skill of ["asset-analysis","forecast-analysis","anomaly-detection","market-research","document-analysis","rwa-verification","treasury-analysis","funding-analysis","report-generation","workflow-planning","impact-calculation"]){
  if(!skills.includes(skill)) errors.push(`Copilot skill missing: ${skill}`);
}

const actions=fs.readFileSync("packages/copilot/src/actions/index.ts","utf8");
for(const token of ["REVIEW_REQUIRED","AWAITING_WALLET","COPILOT_HUMAN_APPROVAL_REQUIRED","COPILOT_EXTERNAL_WALLET_SIGNATURE_REQUIRED"]){
  if(!actions.includes(token)) errors.push(`Copilot action safety missing: ${token}`);
}

const drawer=fs.readFileSync("apps/platform/src/components/copilot/global-copilot.tsx","utf8");
for(const token of ["ASK","ANALYZE","RESEARCH","ACT","Current context","approval","Action Center","agents never sign wallet transactions"]){
  if(!drawer.toLowerCase().includes(token.toLowerCase())) errors.push(`Global Copilot UI missing: ${token}`);
}
if(!drawer.includes("contextSuggestions")) errors.push("Contextual Copilot suggestions not wired");

const header=fs.readFileSync("apps/platform/src/components/header.tsx","utf8");
if(!header.includes("setCopilotOpen(true)")||!header.includes(">Copilot<")) errors.push("Global header Copilot control missing");

const shell=fs.readFileSync("apps/platform/src/components/shell.tsx","utf8");
if(!shell.includes("<GlobalCopilot")) errors.push("Global Copilot drawer not mounted in application shell");

const nav=fs.readFileSync("packages/shared/src/constants/navigation.ts","utf8");
if(!nav.includes('label: "Copilot"')||!nav.includes("Products Overview")) errors.push("Copilot / Products navigation groups missing");

const runApi=fs.readFileSync("apps/platform/src/app/api/v1/copilot/run/route.ts","utf8");
for(const token of ["routeInference","planCopilotRequest","createCopilotActionDraft","agentCanSign:false"]){
  if(!runApi.includes(token)) errors.push(`Copilot run API missing: ${token}`);
}

const store=fs.readFileSync("apps/platform/src/lib/copilot/action-store.ts","utf8");
if(!store.includes("PostgresCopilotRepository")||!store.includes("organizationId")) errors.push("Tenant-scoped persistent Action Center not wired");
if(!store.includes("if(databaseConfigured())")) errors.push("Action Center LIVE persistence switch missing");
if(!store.includes("recordCopilotWalletSignature")) errors.push("External wallet signature recording boundary missing");

const migration=fs.readFileSync("packages/database/prisma/migrations/20260824000100_powerchain_copilot/migration.sql","utf8");
if(!migration.includes("copilot_actions")||!migration.includes("requires_wallet_signature")) errors.push("Copilot Action Center migration incomplete");

const products=fs.readFileSync("packages/data/src/application/catalog/products.ts","utf8");
if(!products.includes("PowerChain Copilot")||!products.includes("Digital Energy OS")||!products.includes("Energy RWA")) errors.push("PowerChain product catalog incomplete");

const openapi=fs.readFileSync("docs/api/swagger.yaml","utf8");
for(const path of ["/copilot/registry:","/copilot/plan:","/copilot/run:","/copilot/actions:"]){
  if(!openapi.includes(path)) errors.push(`OpenAPI missing ${path}`);
}

const legacyAi=fs.readFileSync("apps/platform/src/app/ai/page.tsx","utf8");
const legacyChat=fs.readFileSync("apps/platform/src/app/chat/page.tsx","utf8");
if(!legacyAi.includes('redirect("/copilot")')||!legacyChat.includes('redirect("/copilot")')) errors.push("Legacy AI/chat entry points are not unified under Copilot");

const gateway=fs.readFileSync("packages/ai-gateway/src/index.ts","utf8");
if(!gateway.includes("safe-fallback"))errors.push("AI gateway must expose truthful safe-fallback execution state");
if(!runApi.includes("executionMode"))errors.push("Copilot run API does not expose execution mode");

const architecture=fs.readFileSync("apps/platform/src/app/copilot/architecture/page.tsx","utf8");
const architecturePanel=fs.readFileSync("apps/platform/src/components/copilot/copilot-architecture-panel.tsx","utf8");
const routes=fs.readFileSync("packages/configuration/src/config/routes.ts","utf8");
if(!routes.includes('copilotArchitecture: "/copilot/architecture"'))errors.push("Copilot architecture route not wired");
if(!architecture.includes("CopilotArchitecturePanel")||!architecture.includes("SOURCE OF TRUTH"))errors.push("Copilot architecture workspace incomplete");
if(!architecturePanel.includes("/images/architectures/powerchain-copilot-architecture.png"))errors.push("Canonical Copilot architecture image not rendered");
if(!fs.existsSync("apps/platform/public/images/architectures/powerchain-copilot-architecture.png"))errors.push("Canonical Copilot architecture image missing from public assets");

if(errors.length){
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("PowerChain Copilot v1.0.0 canonical check passed.");
