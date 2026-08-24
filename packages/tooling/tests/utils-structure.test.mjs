import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

test("shared utilities are organized under utils", async () => {
  await assert.rejects(access("helpers.ts"));
  for (const file of ["packages/shared/src/utils/helpers.ts", "packages/shared/src/utils/assets.ts", "packages/shared/src/utils/errors.ts", "packages/shared/src/utils/index.ts"]) {
    await access(file);
  }
});

test("routing defines legacy redirects", async () => {
  const routes = await readFile("packages/configuration/src/config/routes.ts", "utf8");
  const nextConfig = await readFile("apps/platform/next.config.ts", "utf8");
  assert.match(routes, /LEGACY_REDIRECTS/);
  assert.match(nextConfig, /LEGACY_REDIRECTS/);
  assert.match(nextConfig, /Object\.entries\(LEGACY_REDIRECTS\)/);
});
