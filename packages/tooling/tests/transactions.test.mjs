import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
test("transaction API and Cetus adapter are present", async () => {
  const route = await readFile(new URL("../../../apps/platform/src/app/api/v1/transactions/route.ts", import.meta.url), "utf8");
  const cetus = await readFile(new URL("../../../apps/platform/src/lib/integrations/cetus/cetus.ts", import.meta.url), "utf8");
  assert.match(route, /requires_signature/);
  assert.match(cetus, /initCetusSDK/);
});
test("instrumentation entry point stays dependency-free", async () => {
  const source = await readFile(new URL("../../../apps/platform/instrumentation.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /from ["\']\.\/src\//);
});
