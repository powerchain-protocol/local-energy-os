# PowerChain Local Energy OS — Integration Recovery

Your current output proves the Local Energy OS overlay has **not yet been applied to the target monorepo**:

- the Turbo package list contains no `@powerchain/energy-core`, `@powerchain/energy-rwa`, `@powerchain/market-data`, `@powerchain/rewards`, etc.;
- the root `local-energy:*` scripts are absent;
- `packages/token/src/solana/pda.ts` still contains the pre-TypeScript-6 WebCrypto call.

## Install

From the extracted installable bundle:

```bash
node install-local-energy-os.mjs /Users/miko/github/powerchain/crowdfunding-platform
```

Then:

```bash
cd /Users/miko/github/powerchain/crowdfunding-platform

corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile

pnpm run local-energy:doctor
pnpm run local-energy:verify
pnpm run local-energy:build
pnpm run local-energy:typecheck
pnpm typecheck
```

## Confirm before running pnpm

```bash
node - <<'NODE'
const pkg = require("./package.json");
for (const name of [
  "local-energy:doctor",
  "local-energy:verify",
  "local-energy:build",
  "local-energy:typecheck",
]) {
  console.log(name, "=>", pkg.scripts?.[name] ?? "MISSING");
}
NODE

grep -n "digestInput\|subtle.digest" packages/token/src/solana/pda.ts

find packages -maxdepth 2 -name package.json -print | \
  grep -E 'energy-core|energy-rwa|market-data|rewards|safe-actions|rate-limit'
```

The expected WebCrypto code is:

```ts
const digestInput = new ArrayBuffer(input.byteLength);
new Uint8Array(digestInput).set(input);
const digest = await globalThis.crypto.subtle.digest("SHA-256", digestInput);
```
