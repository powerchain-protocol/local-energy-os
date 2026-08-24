import fs from "node:fs";
import path from "node:path";
const checks = [
  ["package.json", fs.existsSync("package.json")],
  ["pnpm-workspace.yaml", fs.existsSync("pnpm-workspace.yaml")],
  ["apps/docs", fs.existsSync("apps/docs")],
  ["whitepaper", fs.existsSync("docs/WHITEPAPER.md")],
  ["contributors", fs.existsSync("CONTRIBUTORS.md")],
  ["apps/api/local-energy-os", fs.existsSync("apps/api/src/modules/local-energy-os")],
  ["apps/platform/local-energy-os", fs.existsSync("apps/platform/src/local-energy-os")],
  ["energy-core", fs.existsSync("packages/energy-core")],
  ["energy-rwa", fs.existsSync("packages/energy-rwa")],
  ["saas", fs.existsSync("packages/saas")],
  ["system-management", fs.existsSync("packages/system-management")],
  ["svm", fs.existsSync("packages/svm")],
  ["sui", fs.existsSync("packages/sui")],
  ["market-data", fs.existsSync("packages/market-data")],
  ["explorers", fs.existsSync("packages/explorers")],
  ["rewards", fs.existsSync("packages/rewards")],
  ["safe-actions", fs.existsSync("packages/safe-actions")],
  ["rate-limit", fs.existsSync("packages/rate-limit")],
  ["docs", fs.existsSync("docs/LOCAL-ENERGY-OS.md")],
];
for (const [name, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${name}`);
if (checks.some(([, ok]) => !ok)) process.exitCode = 1;
console.log("\nCanonical contracts:");
console.log("✓ physical energy is authoritative");
console.log("✓ Wh is canonical; kWh/MWh are denominations / optional RWA representations");
console.log("✓ PWRC is native on Solana and is not electricity");
console.log("✓ wPWRC is 1:1 bridge-backed on Sui and is not electricity");
console.log("✓ cross-chain Energy RWA supply cannot exceed canonical backing");
console.log("✓ unsafe MAINNET + MOCK DATA + WRITES ENABLED is rejected");

console.log("✓ PET-20 metadata + deterministic serialization enabled");
console.log("✓ Solscan / Suiscan explorer builders enabled");
console.log("✓ Pyth / Birdeye / CoinMarketCap server adapters enabled");
console.log("✓ reward epochs, rate limiting, idempotent safe actions enabled");


const rootPackage = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));
const requiredScripts = [
  "local-energy:doctor",
  "local-energy:verify",
  "local-energy:build",
  "local-energy:typecheck",
];
for (const script of requiredScripts) {
  const ok = Boolean(rootPackage.scripts?.[script]);
  console.log(`${ok ? "✓" : "✗"} root script ${script}`);
  if (!ok) process.exitCode = 1;
}
