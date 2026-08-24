import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const providers=["onramp","circle","pyth","jupiter","raydium","orca","meteora","helius","metaplex","helium","cetus","streamflow"];
const payments=["stripe","moonpay","coinbase-pay","solana-pay"];
test("web3 provider adapters are isolated",()=>{for(const provider of providers)assert.ok(fs.existsSync(`packages/integration/src/web3/${provider}/index.ts`),provider)});
test("payment provider adapters are server isolated",()=>{for(const provider of payments)assert.ok(fs.existsSync(`packages/integration/src/payments/${provider}/index.ts`),provider)});
test("Helius uses the current factory SDK API",()=>{const source=fs.readFileSync("packages/integration/src/web3/helius/index.ts","utf8");assert.match(source,/createHelius/);assert.match(source,/from ["']helius-sdk["']/);});
test("Next config is Turbopack-native",()=>{const config=fs.readFileSync("apps/platform/next.config.ts","utf8");assert.match(config,/turbopack:\s*\{\}/);assert.doesNotMatch(config,/webpack\s*\(/)});
test("contract prose is separated from machine artifacts",()=>{assert.ok(fs.existsSync("packages/contracts/src/index.ts"));assert.ok(fs.existsSync("docs/contracts/m/proof-of-energy/README.md"));});
test("platform integrations use canonical adapters instead of removed SDK exports",()=>{
  const helius=fs.readFileSync("apps/platform/src/lib/integrations/helius/index.ts","utf8");
  const sui=fs.readFileSync("apps/platform/src/lib/integrations/sui/index.ts","utf8");
  assert.match(helius,/@powerchain\/integration\/web3\/helius/);
  assert.doesNotMatch(helius,/from ["']helius-sdk["']/);
  assert.match(sui,/@powerchain\/integration\/sui/);
  assert.doesNotMatch(sui,/from ["']@mysten\/sui\/client["']/);
});
