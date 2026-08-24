import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("worker and workspace foundations exist", () => {
  assert.equal(fs.existsSync("apps/platform/src/workers/index.ts"), true);
  assert.equal(fs.existsSync("apps/platform/src/workspaces/index.ts"), true);
});

test("role dashboards provide quick actions", () => {
  const source = fs.readFileSync("packages/data/src/application/catalog/role-dashboards.ts", "utf8");
  assert.match(source, /quickActions:/);
});
