import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const networkConfig = readFileSync("packages/programs/anchor/config/networks.ts", "utf8");
const logic = readFileSync("packages/programs/anchor/tests/program-logic.ts", "utf8");

test("programs define devnet and mainnet-beta targets", () => {
  assert.match(networkConfig, /devnet/);
  assert.match(networkConfig, /mainnet-beta/);
  assert.match(networkConfig, /getProgramNetwork/);
});

test("program settlement logic uses bigint and validation", () => {
  assert.match(logic, /bigint/);
  assert.match(logic, /must be positive/);
  assert.match(logic, /calculateCarbonCredits/);
});
