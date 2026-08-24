import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const rootModules = ["assets.ts", "auth.ts", "iot.ts", "roles.ts", "security.ts"];
const workspaceModules = rootModules.map((name) => `apps/platform/src/lib/workspaces/dashboard/${name}`);

test("dashboard domain modules are not stored at repository root", async () => {
  for (const file of rootModules) {
    await assert.rejects(access(file));
  }
  for (const file of workspaceModules) {
    await access(file);
  }
});

test("instrumentation remains Turbopack-safe and dependency-free", async () => {
  const source = await readFile("apps/platform/instrumentation.ts", "utf8");
  assert.match(source, /export async function register/);
  assert.doesNotMatch(source, /from ["\']\.\/src\//);
});

test("approved remote Web3 icon hosts are configured", async () => {
  const source = await readFile("apps/platform/next.config.ts", "utf8");
  assert.match(source, /s2\.coinmarketcap\.com/);
  assert.match(source, /cryptoicons\.cc/);
});
