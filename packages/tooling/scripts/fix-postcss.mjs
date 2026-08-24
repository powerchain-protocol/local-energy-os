import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const stale = [
  "postcss.config.js",
  "postcss.config.cjs",
  "postcss.config.ts",
  ".postcssrc",
  ".postcssrc.json",
  ".postcssrc.js",
  ".postcssrc.cjs",
];
for (const file of stale) {
  const path = join(root, file);
  if (existsSync(path)) {
    rmSync(path, { force: true });
    console.log(`[PowerChain] Removed stale PostCSS config: ${file}`);
  }
}
const canonical = join(root, "apps/platform/postcss.config.mjs");
if (!existsSync(canonical)) {
  writeFileSync(canonical, 'export default { plugins: { "@tailwindcss/postcss": {} } };\n');
  console.log("[PowerChain] Created postcss.config.mjs");
}
