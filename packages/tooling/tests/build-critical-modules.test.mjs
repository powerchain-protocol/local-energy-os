import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const required = [
  "packages/data/src/application/store/app-store.tsx",
  "packages/data/src/application/catalog/metrics.ts",
  "packages/data/src/application/catalog/role-dashboards.ts",
  "apps/platform/src/lib/wallet/providers.ts",
  "apps/platform/src/lib/observability/tracing.ts",
];

test("build-critical modules exist", () => {
  for (const file of required) assert.equal(existsSync(file), true, `${file} must exist`);
});

test("instrumentation is dependency-free", () => {
  const source = readFileSync("apps/platform/instrumentation.ts", "utf8");
  assert.equal(source.includes("./src/lib/observability/tracing"), false);
});
