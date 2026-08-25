# Release Engineering

Production release verification requires Node 24.x, pnpm 11.23.0 and a committed `pnpm-lock.yaml`.

```bash
corepack enable
corepack use pnpm@11.23.0
pnpm install --no-frozen-lockfile
# commit pnpm-lock.yaml after the first canonical install
pnpm release:verify
```

`release:verify` runs structural checks, method-level OpenAPI coverage, Prisma validation/generation, full workspace typechecking and application builds.

Anchor and Sui Move validation remain additional release gates when their program packages change.
