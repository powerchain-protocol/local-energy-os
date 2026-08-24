import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const appRoot = join(root, "apps/platform");
const allowed = "apps/platform/postcss.config.mjs";
const forbiddenNames = new Set([
  "postcss.config.js",
  "postcss.config.cjs",
  "postcss.config.ts",
  ".postcssrc",
  ".postcssrc.json",
  ".postcssrc.js",
  ".postcssrc.cjs",
]);

const errors = [];
for (const name of forbiddenNames) {
  if (existsSync(join(root, name))) errors.push(`Remove stale PostCSS config: ${name}`);
}

const configPath = join(root, allowed);
if (!existsSync(configPath)) {
  errors.push(`Missing ${allowed}`);
} else {
  const config = readFileSync(configPath, "utf8");
  if (!config.includes('"@tailwindcss/postcss"')) {
    errors.push(`${allowed} must use @tailwindcss/postcss`);
  }
  if (/plugins\s*:\s*\{[^}]*tailwindcss\s*:/s.test(config)) {
    errors.push(`${allowed} must not use tailwindcss directly as a PostCSS plugin`);
  }
}

const cssPath = join(root, "apps/platform/src/styles/globals.css");
if (!existsSync(cssPath)) {
  errors.push("Missing apps/platform/src/styles/globals.css");
} else {
  const css = readFileSync(cssPath, "utf8");
  if (!css.includes('@import "tailwindcss";')) errors.push('globals.css must import Tailwind 4 with @import "tailwindcss";');
  if (/@tailwind\s+(base|components|utilities)/.test(css)) errors.push("Remove Tailwind 3 @tailwind directives from globals.css");
}

const pkg = JSON.parse(readFileSync(join(appRoot, "package.json"), "utf8"));
for (const dependency of ["tailwindcss", "@tailwindcss/postcss", "postcss"]) {
  if (!(dependency in (pkg.devDependencies ?? {})) && !(dependency in (pkg.dependencies ?? {}))) {
    errors.push(`Missing package dependency: ${dependency}`);
  }
}

if (errors.length) {
  console.error("PowerChain CSS configuration check failed:\n- " + errors.join("\n- "));
  process.exit(1);
}
console.log("PowerChain Tailwind 4/PostCSS configuration is valid.");
