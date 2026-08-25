import { spawnSync } from "node:child_process";

import fs from "node:fs";

if (!fs.existsSync("pnpm-lock.yaml")) {
  console.error("Release verification requires a committed pnpm-lock.yaml. Run pnpm install --no-frozen-lockfile on Node 24 and commit the generated lockfile first.");
  process.exit(1);
}

const major = Number(process.versions.node.split(".")[0]);
if (major !== 24) {
  console.error(`PowerChain release verification requires Node 24.x; current ${process.version}`);
  process.exit(1);
}
const commands = [
  ["pnpm", ["doctor:strict"]],
  ["pnpm", ["validate"]],
  ["pnpm", ["api:docs:verify"]],
  ["pnpm", ["prisma:validate"]],
  ["pnpm", ["prisma:generate"]],
  ["pnpm", ["typecheck"]],
  ["pnpm", ["build:apps"]],
];
for (const [command, args] of commands) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log("\nPowerChain release verification passed.");
