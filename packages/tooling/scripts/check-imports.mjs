import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = process.cwd();
const sourceRoot = join(root, "apps/platform/src");
const aliasRoots = [
  ["components/ui/", join(root, "packages/ui/src/components")],
  ["components/common/", join(root, "packages/shared/src/components/common")],
  ["config/", join(root, "packages/configuration/src/config")],
  ["env/", join(root, "packages/configuration/src/env")],
  ["context/", join(root, "packages/shared/src/context")],
  ["constants/", join(root, "packages/shared/src/constants")],
  ["utils/", join(root, "packages/shared/src/utils")],
  ["types/", join(root, "packages/types/src/types")],
  ["schemas/", join(root, "packages/types/src/schemas")],
  ["data/", join(root, "packages/data/src/application/catalog")],
  ["store/", join(root, "packages/data/src/application/store")],
  ["storage/", join(root, "packages/data/src/application/storage")],
  ["lib/database/", join(root, "packages/database/src/clients")],
  ["routes/", join(sourceRoot, "routing/routes")],
  ["routers/", join(sourceRoot, "routing/routers")],
  ["redirect/", join(sourceRoot, "routing/redirects")],
];
const exactAliases = new Map([
  ["constants", join(root, "packages/shared/src/constants/index.ts")],
  ["env", join(root, "packages/configuration/src/env/index.ts")],
  ["utils", join(root, "packages/shared/src/utils/index.ts")],
  ["types", join(root, "packages/types/src/types/index.ts")],
  ["data", join(root, "packages/data/src/application/catalog/index.ts")],
  ["lib/database", join(root, "packages/database/src/clients/index.ts")],
]);
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"];
const ignoredExternal = new Set(["server-only", "client-only"]);
const errors = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (["node_modules", "dist", "coverage", "target", ".next", ".turbo"].includes(entry)) return [];
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function resolves(path) {
  if (existsSync(path) && statSync(path).isFile()) return true;
  for (const extension of extensions) if (existsSync(path + extension)) return true;
  for (const extension of extensions) if (existsSync(join(path, "index" + extension))) return true;
  return false;
}

const rootFiles = [join(root, "apps/platform/instrumentation.ts"), join(root, "apps/platform/proxy.ts")].filter(existsSync);
const packageFiles = walk(join(root, "packages"));
const files = [...walk(sourceRoot), ...packageFiles, ...rootFiles]
  .filter((file) => extensions.includes(extname(file)));

const importPattern = /(?:from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g;
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier.startsWith("@/")) {
      const local = specifier.slice(2);
      const mapping = aliasRoots.find(([prefix]) => local.startsWith(prefix));
      const target = exactAliases.get(local) ?? (mapping ? resolve(mapping[1], local.slice(mapping[0].length)) : resolve(sourceRoot, local));
      if (!resolves(target)) errors.push(`${file.slice(root.length + 1)} -> ${specifier}`);
    } else if (specifier.startsWith(".")) {
      const target = resolve(dirname(file), specifier);
      if (!resolves(target)) errors.push(`${file.slice(root.length + 1)} -> ${specifier}`);
    } else if (ignoredExternal.has(specifier)) {
      continue;
    }
  }
}

if (errors.length) {
  console.error("Unresolved local imports:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Import resolution check passed for ${files.length} source files.`);
