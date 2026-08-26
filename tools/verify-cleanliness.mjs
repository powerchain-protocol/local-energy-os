import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

for (const obsolete of ["scripts", "apps/api/api", "AGENTS.md", "CHANGELOG.md", "VALIDATION_REPORT.md"]) {
  if (fs.existsSync(path.join(root, obsolete))) errors.push(`obsolete:${obsolete}`);
}

const visibleRootMarkdown = fs.readdirSync(root).filter((name) => name.endsWith(".md") && !name.startsWith(".")).sort();
if (visibleRootMarkdown.join(",") !== "CONTRIBUTING.md,README.md") errors.push(`root-markdown:${visibleRootMarkdown.join(",")}`);

const jobs = fs.readFileSync(path.join(root, "apps/worker/src/jobs.ts"), "utf8");
if (/\bnoOp\s*\(/.test(jobs)) errors.push("worker:no-op-job-function");
for (const removedName of ["meter-intervals", "energy-batch-finalization", "market-matching", "settlement-reconciliation", "pwrc-reward-epochs", "cross-chain-reconciliation"]) {
  if (jobs.includes(`name: "${removedName}"`)) errors.push(`worker:dead-scheduled-job:${removedName}`);
}

const appShell = fs.readFileSync(path.join(root, "packages/ui/src/app-shell.tsx"), "utf8");
if (appShell.includes('aria-label="Notifications"')) errors.push("ui:dead-notifications-button");
if (appShell.includes('aria-label="Account menu"')) errors.push("ui:dead-account-button");

const credentialForm = fs.readFileSync(path.join(root, "apps/platform/components/credential-form.tsx"), "utf8");
if (credentialForm.includes("Connect-wallet UI is intentionally not simulated")) errors.push("ui:simulated-wallet-button");


for (const envFile of [".env.local", ".env.example", ".env.local.example", "env/development.env.example", "env/staging.env.example", "env/production.env.example"]) {
  const absolute = path.join(root, envFile);
  if (!fs.existsSync(absolute)) continue;
  const seen = new Set();
  for (const line of fs.readFileSync(absolute, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const key = trimmed.split("=", 1)[0];
    if (seen.has(key)) errors.push(`env-duplicate:${envFile}:${key}`);
    seen.add(key);
  }
}

const rootManifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["db:doctor", "operations:verify", "peers:check", "backend:build", "backend:prisma:validate", "worker:verify", "clean:verify"]) {
  if (!rootManifest.scripts?.[script]) errors.push(`missing-root-script:${script}`);
}

function filesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist", ".next", "generated"].includes(entry.name)) result.push(...filesUnder(absolute));
    } else if (/\.(?:ts|tsx)$/.test(entry.name)) result.push(absolute);
  }
  return result;
}

// Conservative dead-function check: only non-exported function declarations with a single
// identifier occurrence in their own file are treated as dead. Exported API surface is not guessed.
for (const base of ["apps", "packages", "components", "store", "storage"]) {
  for (const file of filesUnder(path.join(root, base))) {
    const source = fs.readFileSync(file, "utf8");
    const declaration = /^(?!\s*export\s)(?:\s*async\s+|\s*)function\s+([A-Za-z_$][\w$]*)\s*\(/gm;
    for (const match of source.matchAll(declaration)) {
      const name = match[1];
      const count = [...source.matchAll(new RegExp(`\\b${name}\\b`, "g"))].length;
      if (count === 1) errors.push(`dead-function:${path.relative(root, file)}:${name}`);
    }
  }
}

if (errors.length) {
  console.error(JSON.stringify({ status: "failed", errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({
  status: "ok",
  checks: ["single-tools-directory", "single-api-contract-source", "root-doc-policy", "worker-no-dead-jobs", "no-dead-shell-buttons", "conservative-dead-function-scan"],
}, null, 2));
