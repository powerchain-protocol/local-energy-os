# Build & Typecheck Troubleshooting

## `Command "local-energy:doctor" not found`

This means the Local Energy OS package files may be present, but the target monorepo root `package.json` was not patched with the root orchestration scripts.

Repair an already-integrated workspace with:

```bash
node scripts/local-energy-os/repair-workspace.mjs .
```

The repair command installs these root scripts:

```text
local-energy:doctor
local-energy:verify
local-energy:build
local-energy:typecheck
```

`local-energy:build` and `local-energy:typecheck` intentionally operate only on Local Energy OS packages. They do not build unrelated PowerChain products.

---

## TypeScript 6 WebCrypto error in `packages/token/src/solana/pda.ts`

Symptom:

```text
Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'BufferSource'
```

TypeScript 6 models generic typed-array backing stores more strictly than older TypeScript versions. `SubtleCrypto.digest()` requires an `ArrayBuffer`-compatible `BufferSource`.

Use an owned `ArrayBuffer`:

```ts
const digestInput = new ArrayBuffer(input.byteLength);
new Uint8Array(digestInput).set(input);
const digest = await globalThis.crypto.subtle.digest("SHA-256", digestInput);
```

This is deterministic and byte-for-byte equivalent to hashing the original `Uint8Array`; it only normalizes the backing-store type.

The Local Energy OS repair command applies this exact compatibility patch when the canonical token file exists.

---

## Validation sequence

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile

node scripts/local-energy-os/repair-workspace.mjs .

pnpm local-energy:doctor
pnpm local-energy:verify
pnpm local-energy:build
pnpm local-energy:typecheck

# Whole PowerChain monorepo validation:
pnpm typecheck
```

A failure in an unrelated workspace package during `pnpm typecheck` does not imply that the Local Energy OS package validation failed. Run `pnpm local-energy:typecheck` first to isolate the Local Energy OS boundary, then run the full monorepo check.
