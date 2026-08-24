import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("PTSP 5.0 portfolio is published", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(packageJson.version, "1.0.0");
  assert.equal(fs.existsSync("apps/platform/src/app/standards/page.tsx"), true);
  assert.equal(fs.existsSync("apps/platform/src/app/api/v1/standards/catalog/route.ts"), true);
  assert.equal(fs.existsSync("docs/PTSP/compatibility-policy.md"), true);
});

test("PTSP lifecycle and traceability are machine readable", () => {
  const catalog = JSON.parse(fs.readFileSync("docs/standards/catalogs/catalog.json", "utf8"));
  const matrix = JSON.parse(fs.readFileSync("packages/engineering/traceability/matrix.json", "utf8"));
  assert.equal(catalog.lifecycle.length, 8);
  assert.ok(matrix.requirements.some((item) => item.standard === "PTSP-210"));
});
