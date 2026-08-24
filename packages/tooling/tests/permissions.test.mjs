import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("permission matrix defines enterprise roles", async () => {
  const source = await readFile(new URL("../../../apps/platform/src/lib/security/permissions.ts", import.meta.url), "utf8");
  for (const role of ["viewer", "operator", "manager", "administrator"]) assert.match(source, new RegExp(role));
});

test("package version is the stable 1.0.0 release", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.version, "1.0.0");
});
