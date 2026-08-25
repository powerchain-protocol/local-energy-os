import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const destination = path.join(root, ".env.local");
const candidates = [path.join(root, ".env.local.example"), path.join(root, ".env.example")];
const source = candidates.find(existsSync);

if (existsSync(destination)) {
  console.log(".env.local already exists; no changes made.");
  process.exit(0);
}
if (!source) {
  console.error("No environment template found. Expected .env.local.example or .env.example.");
  process.exit(1);
}
copyFileSync(source, destination);
console.log(`Created .env.local from ${path.basename(source)}.`);
console.log("Review database, auth, RPC and Supabase values before enabling live writes.");
