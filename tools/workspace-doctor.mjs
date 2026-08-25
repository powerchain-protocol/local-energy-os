import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const errors = [];
const warnings = [];

const requiredRuntime = [
  "README.md",
  "CONTRIBUTING.md",
  "tools",
  "docs/README.md",
  "docs/TOOLS.md",
  "docs/PACKAGES.md",
  "apps/energy",
  "apps/energy/app/energy",
  "apps/energy/app/assets",
  "apps/energy/app/devices",
  "apps/docs",
  "apps/platform",
  "apps/admin",
  "apps/mapper",
  "apps/api",
  "apps/worker",
  "apps/companies",
  "apps/grid",
  "apps/plants",
  "apps/wind",
  "apps/charging",
  "apps/supply-chain",
  "apps/api/api/openapi.yaml",
  "apps/api/api/postman/PowerChain-Local-Energy-OS.postman_collection.json",
  "apps/api/api/postman/PowerChain-Local.postman_environment.json",
  "packages/shared",
  "packages/ui",
  "packages/energy-core",
  "packages/energy-rwa",
  "packages/pwrc",
  "packages/saas",
  "packages/protocols",
  "packages/auth",
  "packages/validation",
  "packages/policy",
  "packages/events",
  "packages/audit",
  "packages/metering",
  "packages/telemetry",
  "packages/settlement",
  "packages/ledger",
  "packages/rewards",
  "packages/system-management",
  "packages/system-management/src/types/status.ts",
  "apps/api/app/api/v1/system/status/route.ts",
  "apps/api/app/api/v1/system/config/route.ts",
  "apps/api/app/api/v1/system/management/route.ts",
  "store/package.json",
  "storage/package.json",
  "docs/programs/overview.md",
  "programs/energy-rwa",
  "docs/programs/energy-rwa.md",
  "move/powerchain",
  "prisma.config.ts",
  "prisma/schema.prisma",
  "docs/database/migrations.md",
  "docs/DATABASE.md",
  "docs/ai/AGENTS.md",
  "components/docs",
  "components/docs/package.json",
  "components/docs/tsconfig.json",
  "storage/src/index.ts",
  "store/src/index.ts",
  "docs/DOCS-APP.md",
  "docs/STORAGE.md",
  "docs/STATE-MANAGEMENT.md",
  "docs/DESIGN-SYSTEM.md",
  "docs/ARCHITECTURE.md",
  "docs/SAAS.md",
  "docs/API.md",
  "docs/ASSETS.md",
  "docs/FULLSTACK.md",
  "docs/AUTHENTICATION.md",
  "docs/SECURITY.md",
  "docs/DATA-PLANE.md",
  "docs/RELEASE.md",
  "supabase/migrations/002_tenant_rls.sql",
  "docs/SUPABASE.md",
  "docs/packages/contracts.md",
  "docs/CONTRACTS.md",
  "docs/PROGRAMS.md",
];

const workspaceMetadata = [
  ".vscode/settings.json",
  ".vscode/tasks.json",
  ".vscode/extensions.json",
  ".windsurf/rules/powerchain.md",
  ".github/copilot-instructions.md",
];

for (const relative of requiredRuntime) {
  if (!fs.existsSync(path.join(root, relative))) errors.push(`missing:${relative}`);
}
for (const relative of workspaceMetadata) {
  if (!fs.existsSync(path.join(root, relative))) warnings.push(`missing-workspace-metadata:${relative}`);
}

function directWorkspaceManifests(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(absolute, entry.name, "package.json"))
    .filter((manifest) => fs.existsSync(manifest));
}

// Keep this aligned with pnpm-workspace.yaml. Do not recursively scan arbitrary
// package.json files: generated artifacts, copied releases and fixture trees are
// not pnpm workspace projects and must not create false duplicate-package errors.
const packageFiles = [
  path.join(root, "package.json"),
  ...directWorkspaceManifests("apps"),
  ...directWorkspaceManifests("packages"),
  ...directWorkspaceManifests("components"),
  path.join(root, "store/package.json"),
  path.join(root, "storage/package.json"),
].filter((manifest) => fs.existsSync(manifest));

const names = new Map();
const workspaceNames = new Set();
const manifests = [];
for (const manifestPath of packageFiles) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifests.push([manifestPath, manifest]);
  if (manifest.version !== "1.0.0") {
    errors.push(`version:${path.relative(root, manifestPath)}:${manifest.version}`);
  }
  if (manifest.name) {
    if (names.has(manifest.name)) {
      errors.push(`duplicate-package:${manifest.name}:${path.relative(root, names.get(manifest.name))}:${path.relative(root, manifestPath)}`);
    }
    names.set(manifest.name, manifestPath);
    workspaceNames.add(manifest.name);
  }
}

for (const [manifestPath, manifest] of manifests) {
  for (const group of ["dependencies", "devDependencies", "peerDependencies"]) {
    for (const [name, version] of Object.entries(manifest[group] ?? {})) {
      if (String(version).startsWith("workspace:") && !workspaceNames.has(name)) {
        errors.push(`missing-workspace-dependency:${path.relative(root, manifestPath)}:${name}`);
      }
    }
  }
}

const units = fs.readFileSync(path.join(root, "packages/energy-core/src/index.ts"), "utf8");
for (const invariant of ["KWH = 1_000n", "MWH = 1_000_000n", "GWH = 1_000_000_000n"]) {
  if (!units.includes(invariant)) errors.push(`energy-unit:${invariant}`);
}

const envTemplateCandidates = [".env.example", ".env.local.example"];
const envTemplate = envTemplateCandidates.find((file) => fs.existsSync(path.join(root, file)));
if (!envTemplate) {
  warnings.push("missing-env-template:.env.example|.env.local.example");
} else {
  const env = fs.readFileSync(path.join(root, envTemplate), "utf8");
  for (const secret of ["SUPABASE_SERVICE_ROLE_KEY", "BETTER_AUTH_SECRET", "HELIUS_API_KEY"]) {
    if (env.includes(`NEXT_PUBLIC_${secret}`)) errors.push(`public-secret:${secret}`);
  }
}

const rootManifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
if (rootManifest.packageManager !== "pnpm@11.23.0") errors.push(`package-manager:${rootManifest.packageManager}`);
for (const [name, expected] of Object.entries({ turbo: "2.10.11", typescript: "7.0.2", prisma: "7.9.1", "@types/node": "24.13.3" })) {
  const actual = rootManifest.devDependencies?.[name];
  if (actual !== expected) errors.push(`toolchain-version:${name}:${actual ?? "missing"}:expected-${expected}`);
}
const visibleRootMarkdown = fs.readdirSync(root).filter((name) => name.endsWith(".md") && !name.startsWith(".")).sort();
for (const name of visibleRootMarkdown) {
  if (!["CONTRIBUTING.md", "README.md"].includes(name)) errors.push(`root-markdown-must-move-to-docs:${name}`);
}
for (const script of ["local-energy:verify", "workspace:bootstrap"]) {
  if (!rootManifest.scripts?.[script]) errors.push(`missing-script:${script}`);
}

const prismaConfig = fs.readFileSync(path.join(root, "prisma.config.ts"), "utf8");
for (const token of [".env.local", "DIRECT_URL", "DATABASE_URL", "SHADOW_DATABASE_URL", "PGHOST", "127.0.0.1"]) {
  if (!prismaConfig.includes(token)) errors.push(`prisma-config-missing:${token}`);
}
for (const script of ["prisma:doctor", "prisma:migrate:dev", "prisma:migrate:init", "prisma:migrate:deploy", "prisma:migrate:status"]) {
  if (!rootManifest.scripts?.[script]) errors.push(`missing-script:${script}`);
}

const workspace = fs.readFileSync(path.join(root, "pnpm-workspace.yaml"), "utf8");
for (const dep of ["@prisma/engines", "esbuild", "prisma", "@tree-sitter-grammars/tree-sitter-yaml@0.7.1", "tree-sitter-json@0.24.8", "tree-sitter@0.21.1 || 0.22.4"]) {
  if (!workspace.includes(`${dep}: true`) && !workspace.includes(`'${dep}': true`)) errors.push(`unapproved-build:${dep}`);
}
for (const dep of ["core-js-pure@3.50.0", "@scarf/scarf"]) {
  if (!workspace.includes(`${dep}: false`) && !workspace.includes(`'${dep}': false`)) errors.push(`missing-denied-build:${dep}`);
}

const prismaSchema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
if (!prismaSchema.includes('provider = "prisma-client"') || !prismaSchema.includes('output   = "../packages/database/src/generated/prisma"')) errors.push("prisma7-generator");
if (/url\s*=\s*env\(/.test(prismaSchema) || /directUrl\s*=/.test(prismaSchema)) errors.push("prisma7-datasource-config");
if (/^enum\s+\w+\s*\{[^\n}]+\}/m.test(prismaSchema)) errors.push("prisma-inline-enum-format");

if (!fs.existsSync(path.join(root, "apps/api/app/api/v1"))) errors.push("missing:/api/v1");
for (const route of ["energy-proofs", "energy-batches", "energy-positions", "energy-reservations", "energy-retirements"]) {
  const source = fs.readFileSync(path.join(root, `apps/api/app/api/v1/${route}/route.ts`), "utf8");
  if (!source.includes("export async function POST")) errors.push(`missing-economic-mutation:${route}`);
  if (source.includes("items:[]")) errors.push(`stub-economic-route:${route}`);
}

for (const model of ["IdempotencyRecord", "AuditLog", "DomainEventOutbox", "EnergySite", "Meter", "PowerPlant", "WindFarm", "ChargingStation", "ChargingSession", "AssetPassport", "User", "OrganizationMembership", "Session", "LinkedWallet", "WalletAuthChallenge"]) {
  if (!prismaSchema.includes(`model ${model}`)) errors.push(`missing-prisma-model:${model}`);
}

const authVerify = path.join(root, "apps/api/app/api/v1/auth/solana/verify/route.ts");
if (!fs.existsSync(authVerify)) errors.push("missing-auth-verify-route");

const rls = fs.readFileSync(path.join(root, "supabase/migrations/002_tenant_rls.sql"), "utf8");
if (!rls.includes("powerchain_has_org") || !rls.includes("energy_positions_member_select")) errors.push("tenant-rls-incomplete");

const anchor = fs.readFileSync(path.join(root, "programs/energy-rwa/src/lib.rs"), "utf8");
for (const token of ["verification_authority", "position_nonce", "finalize_batch", "UnitAlignment"]) {
  if (!anchor.includes(token)) errors.push(`anchor-hardening:${token}`);
}
const move = fs.readFileSync(path.join(root, "move/powerchain/sources/energy_position.move"), "utf8");
for (const token of ["VerifierCap", "finalize_batch", "WH_PER_MWH", "batch.retired_wh"]) {
  if (!move.includes(token)) errors.push(`sui-hardening:${token}`);
}

const docsUiManifest = JSON.parse(fs.readFileSync(path.join(root, "components/docs/package.json"), "utf8"));
if (docsUiManifest.name !== "@powerchain/docs-ui") errors.push("docs-ui-package-name");
for (const dependency of ["@powerchain/shared", "@powerchain/ui"]) {
  if (!String(docsUiManifest.dependencies?.[dependency] ?? "").startsWith("workspace:")) errors.push(`docs-ui-workspace-dependency:${dependency}`);
}
for (const peer of ["next", "react"]) {
  if (!docsUiManifest.peerDependencies?.[peer]) errors.push(`docs-ui-peer-dependency:${peer}`);
}
const docsAppManifest = JSON.parse(fs.readFileSync(path.join(root, "apps/docs/package.json"), "utf8"));
if (!String(docsAppManifest.dependencies?.["@powerchain/docs-ui"] ?? "").startsWith("workspace:")) errors.push("docs-app-missing-docs-ui");

const uiCss = fs.readFileSync(path.join(root, "packages/ui/src/styles.css"), "utf8");
if (!uiCss.includes("height:100dvh") || !uiCss.includes("position:fixed")) errors.push("ui-sidebar-not-full-height");
if (!uiCss.includes("grid-template-columns:1fr 1fr 76px 1fr 1fr")) errors.push("ui-mobile-dock-not-five-part");
if (units.includes("Number(wh)") || units.includes("Number(GWH)") || units.includes("Number(MWH)")) errors.push("energy-display-number-coercion");
for (const target of ["components/docs/docs-shell.tsx", "packages/ui/src/app-shell.tsx"]) {
  const source = fs.readFileSync(path.join(root, target), "utf8");
  if (/<footer\b/i.test(source)) errors.push(`application-footer:${target}`);
}

const pwrc = fs.readFileSync(path.join(root, "packages/pwrc/src/index.ts"), "utf8");
if (!pwrc.includes('PWRC_CHAIN = "SOLANA"') || !pwrc.includes('WPWRC_CHAIN = "SUI"')) errors.push("pwrc-chain-model");
const rwa = fs.readFileSync(path.join(root, "packages/energy-rwa/src/index.ts"), "utf8");
if (!rwa.includes("ENERGY_RWA_OVERISSUANCE") && !units.includes("ENERGY_RWA_OVERISSUANCE")) errors.push("rwa-overissuance-guard");

if (strict && warnings.length) errors.push(...warnings.map((warning) => `strict:${warning}`));

if (errors.length) {
  console.error(JSON.stringify({ status: "failed", errors, warnings }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "ok",
  canonicalVersion: "1.0.0",
  workspaceProjects: packageFiles.length,
  warnings,
  checks: [
    "required-runtime-paths",
    "canonical-versions",
    "pnpm-workspace-package-names",
    "workspace-dependencies",
    "energy-units",
    "pwrc-sui-model",
    "rwa-supply-guard",
    "api-v1",
    "public-secrets",
    "pnpm-build-allowlist",
    "prisma7-contract",
    "prisma-enum-format",
    "economic-mutations",
    "idempotency",
    "audit-outbox",
    "infrastructure-models",
    "session-auth",
    "tenant-rls",
    "anchor-rwa-hardening",
    "sui-rwa-hardening",
    "brand-ui-shell",
    "five-part-mobile-nav",
    "bigint-energy-display",
    "no-application-footer",
    "prisma-env-resolution",
    "prisma-migration-workflow",
    "contracts-docs",
    "program-docs",
    "docs-ui-workspace-boundary",
  ],
}, null, 2));
