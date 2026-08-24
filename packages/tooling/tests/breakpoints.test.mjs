import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../../../packages/configuration/src/config/breakpoints.ts', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('../../../apps/platform/tailwind.config.ts', import.meta.url), 'utf8');
const expected = [360, 640, 768, 1024, 1280, 1536, 1920];

test('breakpoints are strictly increasing', () => {
  for (let index = 1; index < expected.length; index += 1) {
    assert.ok(expected[index] > expected[index - 1]);
  }
});

test('runtime and Tailwind breakpoint values remain synchronized', () => {
  for (const value of expected) {
    assert.match(source, new RegExp(`[: ]${value}[,\\n]`));
    assert.match(tailwind, new RegExp(`'${value}px'`));
  }
});
