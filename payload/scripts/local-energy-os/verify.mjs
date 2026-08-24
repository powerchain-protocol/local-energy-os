import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const required = [
  "packages/energy-core/src/units.ts",
  "packages/energy-core/src/invariants.ts",
  "packages/energy-rwa/src/index.ts",
  "packages/pwrc/src/index.ts",
  "packages/pwrc-bridge/src/index.ts",
  "packages/saas/src/index.ts",
  "packages/system-management/src/index.ts",
  "packages/oracles/src/index.ts",
  "packages/x402/src/index.ts",
  "packages/cctp/src/index.ts",
  "packages/cross-chain/src/index.ts",
  "packages/svm/src/index.ts",
  "packages/sui/src/index.ts",
  "packages/crypto-utils/src/index.ts",
  "packages/local-energy-config/src/index.ts",
  "packages/explorers/src/index.ts",
  "packages/market-data/src/index.ts",
  "packages/rate-limit/src/index.ts",
  "packages/safe-actions/src/index.ts",
  "packages/rewards/src/index.ts",
  "scripts/local-energy-os/workspace-runner.mjs",
  "scripts/local-energy-os/repair-workspace.mjs",
  "docs/BUILD-TROUBLESHOOTING.md",
  "CONTRIBUTORS.md",
  "docs/WHITEPAPER.md",
  "apps/docs/src/app/[slug]/page.tsx",
  "apps/docs/src/app/page.tsx",
  "apps/docs/package.json",
  "apps/api/src/modules/local-energy-os/routes.ts",
  "apps/platform/src/local-energy-os/catalog.ts",
  "supabase/migrations/202608230001_local_energy_os.sql",
  "supabase/migrations/202608230002_local_energy_saas_system.sql",
  "supabase/migrations/202608230003_energy_rwa_integrations_security.sql",
  "docs/LOCAL-ENERGY-OS.md",
  "docs/SECURITY.md",
  "docs/OPERATIONS.md",
];
const missing = required.filter((entry) => !fs.existsSync(path.join(root, entry)));
if (missing.length) { console.error("Missing Local Energy OS files:\n" + missing.map((x) => ` - ${x}`).join("\n")); process.exit(1); }
const units = fs.readFileSync(path.join(root, "packages/energy-core/src/units.ts"), "utf8");
for (const contract of ["WH = 1n", "KWH = 1_000n", "MWH = 1_000_000n", "GWH = 1_000_000_000n"]) if (!units.includes(contract)) throw new Error(`Missing unit contract ${contract}`);
const pwrc = fs.readFileSync(path.join(root, "packages/pwrc/src/index.ts"), "utf8");
if (!pwrc.includes('network: "solana-mainnet-beta"')) throw new Error("PWRC must remain native to Solana");
if (!pwrc.includes('symbol: "wPWRC"') || !pwrc.includes('network: "sui"')) throw new Error("wPWRC must remain the Sui bridge representation");
const system = fs.readFileSync(path.join(root, "packages/system-management/src/index.ts"), "utf8");
if (!system.includes("MAINNET + MOCK DATA + WRITES ENABLED")) throw new Error("Runtime safety contract missing");

const rwa = fs.readFileSync(path.join(root, "packages/energy-rwa/src/types.ts"), "utf8");
if (!rwa.includes('standard: "PET-20"') || !rwa.includes('canonicalUnit: "Wh"')) throw new Error("PET-20 Energy RWA metadata contract missing");
const explorers = fs.readFileSync(path.join(root, "packages/explorers/src/index.ts"), "utf8");
if (!explorers.includes("solscan.io") || !explorers.includes("suiscan.xyz")) throw new Error("Explorer integration missing");
const market = fs.readFileSync(path.join(root, "packages/market-data/src/pyth.ts"), "utf8");
if (!market.includes("/v2/updates/price/latest")) throw new Error("Pyth Hermes v2 integration missing");


const rootPackage = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["local-energy:doctor", "local-energy:verify", "local-energy:build", "local-energy:typecheck"]) {
  if (!rootPackage.scripts?.[script]) throw new Error(`Root orchestration script missing: ${script}`);
}
const docsPackage = JSON.parse(fs.readFileSync(path.join(root, "apps/docs/package.json"), "utf8"));
if (!["@powerchain/docs-app", "@powerchain/docs"].includes(docsPackage.name)) {
  throw new Error(`Unexpected docs app package name: ${docsPackage.name}`);
}

console.log("PowerChain Local Energy OS v1.0.0 canonical verification passed.");
