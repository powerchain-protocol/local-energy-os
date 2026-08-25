import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
let loaded = false;

export function loadPowerChainRootEnv(): string {
  if (loaded) return repositoryRoot;
  for (const name of [".env.local", ".env"]) {
    const file = path.join(repositoryRoot, name);
    if (existsSync(file)) process.loadEnvFile(file);
  }
  loaded = true;
  return repositoryRoot;
}
