import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("network schema supports Solana and Sui targets", () => {
  const source = readFileSync("packages/types/src/schemas/config/networks.ts", "utf8");
  assert.match(source, /mainnet-beta/);
  assert.match(source, /testnet/);
  assert.match(source, /RPC URL must use HTTPS/);
});
