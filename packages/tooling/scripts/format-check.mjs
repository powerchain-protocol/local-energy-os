import { access, readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const roots = ["apps/platform/src", "packages", "apps", "packages/database/prisma"];
const supported = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const failures = [];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function scan(path) {
  if (!(await exists(path))) return;
  for (const item of await readdir(path, { withFileTypes: true })) {
    const target = join(path, item.name);
    if (item.isDirectory()) await scan(target);
    else if (supported.has(extname(item.name))) {
      const content = await readFile(target, "utf8");
      if (content.includes("\t")) failures.push(`${target}: contains tabs`);
      if (!content.endsWith("\n")) failures.push(`${target}: missing final newline`);
    }
  }
}

for (const root of roots) await scan(root);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Formatting hygiene checks passed.");
