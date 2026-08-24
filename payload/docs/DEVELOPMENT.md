# Development

Canonical monorepo domains are organized under `apps/`, `packages/`, `programs/`, `move/`, `prisma/`, `supabase/`, `docs/`, and `tooling/`.

Verification:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile
pnpm local-energy:doctor
pnpm local-energy:verify
pnpm local-energy:build
pnpm typecheck
```

The overlay installer is additive and patches existing app dependencies rather than replacing unrelated application code.


## Documentation application

The deployable documentation app lives in `apps/docs/` and renders canonical Markdown from the root `docs/` directory.

```bash
pnpm --filter @powerchain/docs dev
pnpm --filter @powerchain/docs typecheck
pnpm --filter @powerchain/docs build
```

The whitepaper source is `docs/WHITEPAPER.md`. Keep the canonical Markdown source authoritative; do not fork protocol rules into app-local copies.
