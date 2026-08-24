import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const payload = path.join(here, "payload");
const target = path.resolve(process.argv[2] ?? process.cwd());

const packageJson = path.join(target, "package.json");
if (!fs.existsSync(packageJson)) {
  console.error(`PowerChain repository root not found: ${target}`);
  console.error("Pass the monorepo root explicitly:");
  console.error("  node install-local-energy-os.mjs /path/to/powerchain");
  process.exit(1);
}

const apply = path.join(payload, "scripts/local-energy-os/apply.mjs");
if (!fs.existsSync(apply)) {
  console.error(`Installer payload is incomplete: ${apply}`);
  process.exit(1);
}

console.log(`Installing PowerChain Local Energy OS v1.0.0 into:`);
console.log(`  ${target}`);
console.log("");

const result = spawnSync(process.execPath, [apply, target], {
  cwd: payload,
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("");
console.log("Integration applied.");
console.log("");
console.log("Verify root scripts:");
console.log(`  cd "${target}"`);
console.log("  node -e 'console.log(Object.keys(require(\"./package.json\").scripts).filter(k => k.startsWith(\"local-energy:\")))'");
console.log("");
console.log("Then run:");
console.log("  pnpm install --no-frozen-lockfile");
console.log("  pnpm run local-energy:doctor");
console.log("  pnpm run local-energy:verify");
console.log("  pnpm run local-energy:build");
console.log("  pnpm run local-energy:typecheck");
console.log("  pnpm typecheck");
