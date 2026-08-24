import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

test("marketplace architecture modules are present", () => {
  for (const path of [
    "packages/types/src/types/marketplace/index.ts",
    "apps/platform/src/lib/marketplace/index.ts",
    "apps/platform/src/services/marketplace/index.ts",
    "apps/platform/src/events/marketplace/index.ts",
    "docs/architecture/MARKETPLACE.md",
  ]) assert.equal(fs.existsSync(path), true, path);
});

test("marketplace API aliases and recommendations are registered", () => {
  const route = read("apps/platform/src/app/api/v1/marketplace/recommendations/route.ts");
  assert.match(route, /getMarketplaceRecommendations/);
  assert.equal(fs.existsSync("apps/platform/src/app/api/v1/marketplace/dashboard/route.ts"), true);
});
