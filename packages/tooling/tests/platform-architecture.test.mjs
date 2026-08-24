import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("platform architecture route and API are registered", () => {
  assert.match(read("packages/configuration/src/config/routes.ts"), /platform: "\/platform"/);
  assert.ok(fs.existsSync("apps/platform/src/app/platform/page.tsx"));
  assert.ok(fs.existsSync("apps/platform/src/app/api/v1/platform/catalog/route.ts"));
});

test("cloud architecture includes all enterprise layers", () => {
  const catalog = read("packages/data/src/application/catalog/platform/catalog.ts");
  for (const layer of ["foundation", "cloud", "fabric", "runtime", "studios", "hubs", "marketplaces", "intelligence", "experience", "ecosystem"]) {
    assert.match(catalog, new RegExp(`id: "${layer}"`));
  }
});

test("canonical layer folders expose public entry points", () => {
  for (const layer of ["foundation", "cloud", "fabric", "runtime", "domains", "intelligence", "operations", "developer", "experience", "shared"]) {
    assert.ok(fs.existsSync(`apps/platform/src/${layer}/index.ts`), `${layer} index is missing`);
    assert.ok(fs.existsSync(`apps/platform/src/${layer}/README.md`), `${layer} README is missing`);
  }
});
