import { existsSync, readFileSync } from "node:fs";
const required = ["docs/architecture/PPA-3.0.md", "docs/standards/index.md", "docs/reference-models/index.md", "packages/types/src/schemas/json/architecture-contract.schema.json", "apps/platform/src/app/architecture/page.tsx", "apps/platform/src/app/api/v1/architecture/catalog/route.ts"];
const missing = required.filter((file) => !existsSync(file));
if (missing.length) { console.error(`Missing PPA artifacts:\n${missing.join("\n")}`); process.exit(1); }
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
if (pkg.version !== "1.0.0") { console.error("Unexpected package version"); process.exit(1); }
console.log("PowerChain PPA 3.0 architecture artifacts verified.");
