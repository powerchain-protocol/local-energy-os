import { spawnSync } from "node:child_process";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error("Unable to start Prisma migration:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
