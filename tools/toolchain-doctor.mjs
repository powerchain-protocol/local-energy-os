import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const expected = {
  node: "24.19.0",
  pnpm: "11.23.0",
  typescript: "7.0.2",
  nodeTypes: "24.13.3",
};
const errors = [];

if (process.version !== `v${expected.node}`) errors.push(`node:${process.version}:expected-v${expected.node}`);
let pnpmVersion = "unavailable";
try { pnpmVersion = execFileSync("pnpm", ["--version"], { encoding: "utf8" }).trim(); } catch {}
if (pnpmVersion !== expected.pnpm) errors.push(`pnpm:${pnpmVersion}:expected-${expected.pnpm}`);

for (const [file, value] of [[".nvmrc", expected.node], [".node-version", expected.node]]) {
  const full = path.join(root, file);
  if (!fs.existsSync(full) || fs.readFileSync(full, "utf8").trim() !== value) errors.push(`${file}:expected-${value}`);
}
if (manifest.packageManager !== `pnpm@${expected.pnpm}`) errors.push(`packageManager:${manifest.packageManager}`);
if (manifest.devDependencies?.typescript !== expected.typescript) errors.push(`manifest-typescript:${manifest.devDependencies?.typescript}`);
if (manifest.devDependencies?.["@types/node"] !== expected.nodeTypes) errors.push(`manifest-node-types:${manifest.devDependencies?.["@types/node"]}`);

const installedChecks = [
  ["typescript/package.json", expected.typescript, "typescript"],
  ["@types/node/package.json", expected.nodeTypes, "@types/node"],
];
for (const [modulePath, expectedVersion, name] of installedChecks) {
  const full = path.join(root, "node_modules", modulePath);
  if (!fs.existsSync(full)) errors.push(`installed:${name}:missing`);
  else {
    const version = JSON.parse(fs.readFileSync(full, "utf8")).version;
    if (version !== expectedVersion) errors.push(`installed:${name}:${version}:expected-${expectedVersion}`);
  }
}

if (errors.length) {
  console.error(JSON.stringify({ status: "failed", errors, remediation: [
    "nvm use",
    "corepack enable",
    "corepack use pnpm@11.23.0",
    "pnpm install --no-frozen-lockfile",
  ] }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: "ok", node: expected.node, pnpm: expected.pnpm, typescript: expected.typescript, nodeTypes: expected.nodeTypes }, null, 2));
