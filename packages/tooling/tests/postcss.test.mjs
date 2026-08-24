import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("Tailwind 4 uses the dedicated PostCSS plugin", () => {
  assert.equal(existsSync("apps/platform/postcss.config.mjs"), true);
  const config = readFileSync("apps/platform/postcss.config.mjs", "utf8");
  const css = readFileSync("apps/platform/src/styles/globals.css", "utf8");
  assert.match(config, /@tailwindcss\/postcss/);
  assert.doesNotMatch(config, /tailwindcss\s*:/);
  assert.match(css, /@import "tailwindcss";/);
  assert.doesNotMatch(css, /@tailwind\s+(base|components|utilities)/);
});
