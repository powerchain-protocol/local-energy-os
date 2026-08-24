import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("distributed exchange and edge platform are wired", async () => {
  const navigation = await readFile("packages/shared/src/constants/navigation.ts", "utf8");
  const exchange = await readFile("apps/platform/src/app/exchange/page.tsx", "utf8");
  const meter = await readFile("apps/platform/src/app/metering/smart-meters/page.tsx", "utf8");
  assert.match(navigation, /Exchange/);
  assert.match(exchange, /Distributed Energy Exchange/);
  assert.match(meter, /Smart Meter & Edge Operations Center/);
});
