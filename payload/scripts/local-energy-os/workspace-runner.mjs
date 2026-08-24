import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const command = process.argv[2];
if (!["build", "typecheck"].includes(command)) {
  console.error("Usage: node scripts/local-energy-os/workspace-runner.mjs <build|typecheck>");
  process.exit(2);
}

const packageDirs = [
  "energy-core",
  "energy-rwa",
  "pwrc",
  "pwrc-bridge",
  "local-energy-market",
  "local-energy-settlement",
  "local-energy-api",
  "protocol-registry",
  "saas",
  "system-management",
  "oracles",
  "x402",
  "cctp",
  "cross-chain",
  "svm",
  "sui",
  "crypto-utils",
  "local-energy-config",
  "explorers",
  "market-data",
  "rate-limit",
  "safe-actions",
  "rewards",
];

const filters = [];
for (const dir of packageDirs) {
  const packageJson = path.join(process.cwd(), "packages", dir, "package.json");
  if (!fs.existsSync(packageJson)) continue;
  const pkg = JSON.parse(fs.readFileSync(packageJson, "utf8"));
  if (pkg.name) filters.push(pkg.name);
}

if (!filters.length) {
  console.error("No PowerChain Local Energy OS workspace packages were found.");
  process.exit(1);
}

const args = ["-r"];
for (const filter of filters) args.push("--filter", filter);
args.push("run", command);

console.log(`PowerChain Local Energy OS ${command}: ${filters.length} packages`);
const result = spawnSync("pnpm", args, {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
process.exit(result.status ?? 1);
