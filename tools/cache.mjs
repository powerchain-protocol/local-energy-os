import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cacheRoot = path.join(root, "cache");
const command = process.argv[2] ?? "status";
function size(dir) {
  if (!fs.existsSync(dir)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? size(full) : fs.statSync(full).size;
  }
  return total;
}
if (command === "clean") {
  fs.rmSync(path.join(cacheRoot, "turbo"), { recursive: true, force: true });
  console.log(JSON.stringify({ status: "ok", cache: "cache/turbo", action: "cleaned" }, null, 2));
} else if (command === "status") {
  console.log(JSON.stringify({ status: "ok", cache: "cache/turbo", bytes: size(path.join(cacheRoot, "turbo")) }, null, 2));
} else {
  console.error(`Unknown cache command: ${command}`);
  process.exit(1);
}
