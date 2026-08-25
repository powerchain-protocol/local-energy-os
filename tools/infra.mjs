import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const action = process.argv[2] ?? "doctor";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: root,
    stdio: options.capture ? "pipe" : "inherit",
    encoding: "utf8",
    ...options,
  });
}

function hasDockerCli() {
  const result = run("docker", ["--version"], { capture: true });
  return !result.error && result.status === 0;
}

function dockerDaemonReady() {
  const result = run("docker", ["info"], { capture: true });
  return !result.error && result.status === 0;
}

function composeReady() {
  const result = run("docker", ["compose", "version"], { capture: true });
  return !result.error && result.status === 0;
}

function failMissingDocker() {
  console.error(`\n[PowerChain infra] Docker CLI was not found in PATH.\n\n` +
`Local PostgreSQL/Redis from compose.yaml require a Docker-compatible runtime.\n\n` +
`macOS — Docker Desktop:\n` +
`  brew install --cask docker\n` +
`  open -a Docker\n` +
`  docker version\n` +
`  docker compose version\n\n` +
`Then rerun:\n` +
`  pnpm infra:doctor\n` +
`  pnpm infra:up\n\n` +
`If you already use Supabase/managed PostgreSQL and managed Redis, configure DATABASE_URL/DIRECT_URL/REDIS_URL and skip pnpm infra:up.\n`);
  process.exit(1);
}

function assertDocker() {
  if (!hasDockerCli()) failMissingDocker();
  if (!composeReady()) {
    console.error("\n[PowerChain infra] Docker is installed, but `docker compose` is unavailable. Install/enable Docker Compose v2, then rerun `pnpm infra:doctor`.\n");
    process.exit(1);
  }
  if (!dockerDaemonReady()) {
    console.error("\n[PowerChain infra] Docker CLI is installed, but the Docker daemon is not reachable. Start Docker Desktop (or your Docker-compatible runtime) and rerun `pnpm infra:up`.\n");
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(root, "compose.yaml"))) {
  console.error("[PowerChain infra] compose.yaml is missing.");
  process.exit(1);
}

switch (action) {
  case "doctor":
    assertDocker();
    console.log("[PowerChain infra] Docker CLI, daemon, and Compose v2 are ready.");
    break;
  case "up":
    assertDocker();
    process.exit(run("docker", ["compose", "up", "-d", "--wait", "postgres", "redis"]).status ?? 1);
  case "down":
    assertDocker();
    process.exit(run("docker", ["compose", "down"]).status ?? 1);
  case "reset":
    assertDocker();
    process.exit(run("docker", ["compose", "down", "-v"]).status ?? 1);
  case "status":
    assertDocker();
    process.exit(run("docker", ["compose", "ps"]).status ?? 1);
  case "logs":
    assertDocker();
    process.exit(run("docker", ["compose", "logs", "--tail=100", "postgres", "redis"]).status ?? 1);
  default:
    console.error(`[PowerChain infra] Unknown action: ${action}`);
    process.exit(1);
}
