import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const overlayRoot = path.resolve(here, "../..");
const target = path.resolve(process.argv[2] ?? "");
if (!process.argv[2] || !fs.existsSync(target)) {
  console.error("Usage: node scripts/local-energy-os/apply.mjs /path/to/powerchain");
  process.exit(1);
}
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
const copyOwned = (relative) => {
  const source = path.join(overlayRoot, relative);
  if (!fs.existsSync(source)) return;
  const destination = path.join(target, relative);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
};

const owned = [
  "packages/energy-core", "packages/energy-rwa", "packages/pwrc", "packages/pwrc-bridge",
  "packages/local-energy-market", "packages/local-energy-settlement", "packages/local-energy-api",
  "packages/protocol-registry", "packages/saas", "packages/system-management", "packages/oracles",
  "packages/x402", "packages/cctp", "packages/cross-chain", "packages/svm", "packages/sui",
  "packages/crypto-utils", "packages/local-energy-config", "packages/explorers", "packages/market-data", "packages/rate-limit", "packages/safe-actions", "packages/rewards",
  "apps/docs/src", "apps/docs/public", "apps/docs/README.md", "apps/docs/next.config.ts", "apps/docs/next-env.d.ts", "apps/api/src/modules/local-energy-os", "apps/platform/src/local-energy-os", "apps/explorer/src/local-energy",
  "apps/worker/src/jobs/local-energy", "apps/realtime/src/local-energy", "apps/indexer/src/local-energy",
  "apps/energy/src/features/local-energy-os", "apps/home/src/features/local-energy-os",
  "apps/grid/src/features/local-energy-os", "apps/charging/src/features/local-energy-os",
  "apps/mapper/src/features/local-energy-os", "apps/website/public/assets/local-energy",
  "supabase/migrations/202608230001_local_energy_os.sql", "supabase/migrations/202608230002_local_energy_saas_system.sql", "supabase/migrations/202608230003_energy_rwa_integrations_security.sql",
  "programs/local-energy", "move/powerchain-local-energy", "move/powerchain",
  "prisma/local-energy-os", "tooling/local-energy-os",
  "docs/README.md", "docs/WHITEPAPER.md", "docs/ARCHITECTURE.md", "docs/LOCAL-ENERGY-OS.md", "docs/ENERGY-RWA.md",
  "docs/PWRC.md", "docs/CROSS-CHAIN.md", "docs/SOLANA.md", "docs/SUI.md", "docs/PROGRAMS.md",
  "docs/SAAS.md", "docs/P2P-LOCAL-ENERGY.md", "docs/EV-CHARGING.md", "docs/POWER-PLANTS.md",
  "docs/WIND-FARMS.md", "docs/GRID.md", "docs/MAPPER.md", "docs/SUPPLY-CHAIN.md", "docs/X402.md",
  "docs/CCTP.md", "docs/ORACLES.md", "docs/SETTLEMENT.md", "docs/API.md", "docs/SECURITY.md",
  "docs/OPERATIONS.md", "docs/DEVELOPMENT.md", "docs/PROTOCOL-REGISTRY.md", "docs/TECHNICAL-ARCHITECTURE.md", "docs/PLATFORM.md", "docs/BRIDGE.md", "docs/MACHINE-ECONOMY.md", "docs/MARKET-DATA.md", "docs/EXPLORERS.md", "docs/REWARDS.md", "docs/SAFE-ACTIONS.md", "docs/CHANGELOG.local-energy-os.md",
  "scripts/local-energy-os"
];

for (const relative of owned) copyOwned(relative);

// Merge the docs package rather than blindly replacing an existing PowerChain
// docs application package manifest.
const docsSourcePackagePath = path.join(overlayRoot, "apps/docs/package.json");
const docsTargetPackagePath = path.join(target, "apps/docs/package.json");
if (fs.existsSync(docsSourcePackagePath)) {
  const sourcePackage = readJson(docsSourcePackagePath);
  if (fs.existsSync(docsTargetPackagePath)) {
    const targetPackage = readJson(docsTargetPackagePath);
    targetPackage.scripts = { ...(targetPackage.scripts ?? {}), ...(sourcePackage.scripts ?? {}) };
    targetPackage.dependencies = { ...(targetPackage.dependencies ?? {}), ...(sourcePackage.dependencies ?? {}) };
    targetPackage.devDependencies = { ...(targetPackage.devDependencies ?? {}), ...(sourcePackage.devDependencies ?? {}) };
    targetPackage.version ??= sourcePackage.version;
    targetPackage.private = true;
    writeJson(docsTargetPackagePath, targetPackage);
  } else {
    fs.mkdirSync(path.dirname(docsTargetPackagePath), { recursive: true });
    fs.copyFileSync(docsSourcePackagePath, docsTargetPackagePath);
  }
}

const contributorsSource = path.join(overlayRoot, "CONTRIBUTORS.md");
const contributorsTarget = path.join(target, "CONTRIBUTORS.md");
if (!fs.existsSync(contributorsTarget) && fs.existsSync(contributorsSource)) {
  fs.copyFileSync(contributorsSource, contributorsTarget);
}


const appendOnce = (file, marker, text) => {
  if (!fs.existsSync(file)) return;
  const current = fs.readFileSync(file, "utf8");
  if (!current.includes(marker)) fs.appendFileSync(file, `\n\n${text.trim()}\n`);
};
appendOnce(path.join(target, "README.md"), "## PowerChain Local Energy OS v1.0.0", `
## PowerChain Local Energy OS v1.0.0

The Local Energy OS integration is installed under apps/, packages/, programs/, move/, supabase/ and docs/. See docs/LOCAL-ENERGY-OS.md and docs/WHITEPAPER.md.
`);
appendOnce(path.join(target, "CHANGELOG.md"), "### PowerChain Local Energy OS v1.0.0", `
### PowerChain Local Energy OS v1.0.0 — 2026-08-23

Integrated verified Energy RWA, PWRC/wPWRC separation, SaaS control plane, reward epochs, Solscan/Suiscan explorers, Pyth/Birdeye/CoinMarketCap market data, rate processing, rate limiting and safe actions.
`);

const packagePath = path.join(target, "package.json");
if (fs.existsSync(packagePath)) {
  const pkg = readJson(packagePath);
  pkg.scripts ??= {};
  pkg.scripts["local-energy:verify"] = "node scripts/local-energy-os/verify.mjs";
  pkg.scripts["local-energy:doctor"] = "node scripts/local-energy-os/doctor.mjs";
  pkg.scripts["local-energy:build"] = "node scripts/local-energy-os/workspace-runner.mjs build";
  pkg.scripts["local-energy:typecheck"] = "node scripts/local-energy-os/workspace-runner.mjs typecheck";

  let docsPackageName = "@powerchain/docs-app";
  const docsManifest = path.join(target, "apps/docs/package.json");
  if (fs.existsSync(docsManifest)) {
    try { docsPackageName = readJson(docsManifest).name || docsPackageName; } catch {}
  }
  pkg.scripts["docs:dev"] ??= `pnpm --filter ${docsPackageName} dev`;
  pkg.scripts["docs:build"] ??= `pnpm --filter ${docsPackageName} build`;
  pkg.scripts["docs:typecheck"] ??= `pnpm --filter ${docsPackageName} typecheck`;
  writeJson(packagePath, pkg);
}

const workspacePath = path.join(target, "pnpm-workspace.yaml");
if (fs.existsSync(workspacePath)) {
  let workspace = fs.readFileSync(workspacePath, "utf8");

  const ensureWorkspacePattern = (pattern) => {
    if (workspace.includes(pattern)) return;
    const packagesHeader = /^packages:\s*$/m;
    if (!packagesHeader.test(workspace)) {
      workspace = `packages:\n  - '${pattern}'\n\n${workspace}`;
      return;
    }
    workspace = workspace.replace(packagesHeader, (header) => `${header}\n  - '${pattern}'`);
  };

  ensureWorkspacePattern("apps/*");
  ensureWorkspacePattern("packages/*");
  fs.writeFileSync(workspacePath, workspace);
}


// TypeScript 6 / WebCrypto compatibility for the existing canonical token
// package. This changes only the backing-store type passed to digest; bytes are
// preserved exactly.
const tokenPda = path.join(target, "packages/token/src/solana/pda.ts");
if (fs.existsSync(tokenPda)) {
  let tokenSource = fs.readFileSync(tokenPda, "utf8");
  const oldDigest = 'const digest = await globalThis.crypto.subtle.digest("SHA-256", input);';
  if (tokenSource.includes(oldDigest)) {
    tokenSource = tokenSource.replace(oldDigest, [
      "// TS 6 / WebCrypto BufferSource compatibility.",
      "const digestInput = new ArrayBuffer(input.byteLength);",
      "new Uint8Array(digestInput).set(input);",
      'const digest = await globalThis.crypto.subtle.digest("SHA-256", digestInput);',
    ].join("\n"));
    fs.writeFileSync(tokenPda, tokenSource);
  }
}

const dependencyMap = readJson(path.join(overlayRoot, "integration/app-dependencies.json"));
for (const [appDir, dependencies] of Object.entries(dependencyMap)) {
  const appPackagePath = path.join(target, appDir, "package.json");
  if (!fs.existsSync(appPackagePath)) continue;
  const appPackage = readJson(appPackagePath);
  appPackage.dependencies ??= {};
  for (const [name, version] of Object.entries(dependencies)) appPackage.dependencies[name] ??= version;
  writeJson(appPackagePath, appPackage);
}

writeJson(path.join(target, ".powerchain-local-energy-os-overlay.json"), {
  name: "PowerChain Local Energy OS",
  version: "1.0.0",
  canonicalEnergyUnit: "Wh",
  energyRwaDisplayUnits: ["kWh", "MWh"],
  pwrcNetwork: "SOLANA",
  wpwrcNetwork: "SUI",
  physicalEnergyAuthoritative: true,
  docsApp: "apps/docs",
  whitepaper: "docs/WHITEPAPER.md",
  appliedAt: new Date().toISOString(),
});
console.log(`Applied/updated PowerChain Local Energy OS v1.0.0 in ${target}`);
console.log("Next: pnpm install --no-frozen-lockfile && pnpm local-energy:verify && pnpm local-energy:build && pnpm typecheck");
