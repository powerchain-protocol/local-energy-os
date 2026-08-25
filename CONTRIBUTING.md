# Contributing to PowerChain Local Energy OS

PowerChain Local Energy OS uses a pnpm monorepo with strict physical-energy, tenant-isolation, and economic-mutation invariants.

## Toolchain

- Node.js 24.19.0 LTS (`nvm use`)
- pnpm 11.23.0 via Corepack
- PostgreSQL or Supabase PostgreSQL
- Docker only when using the local Postgres/Redis stack
- Anchor/Solana and Sui tooling only for on-chain program validation

## Setup

```bash
nvm use
corepack enable
corepack use pnpm@11.23.0
pnpm install --no-frozen-lockfile
pnpm workspace:bootstrap
pnpm env:setup
```

After `pnpm-lock.yaml` is updated and committed, use `pnpm install --frozen-lockfile` for deterministic installs.

## Required checks

```bash
pnpm toolchain:doctor
pnpm db:status
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

Release candidates must also pass:

```bash
pnpm release:verify
```

## Repository rules

- Physical energy is authoritative.
- Canonical physical quantities use bigint Wh internally.
- PWRC is native on Solana; wPWRC is its 1:1 Sui bridge representation.
- kWh/MWh Energy RWA supply must never exceed verified physical backing.
- Economic POST mutations require validation, authorization, idempotency, audit, and outbox handling.
- Application APIs live under `/api/v1`.
- Never fabricate telemetry, balances, settlement state, prices, receipts, or chain confirmations.
- Keep operational application sidebars full-height and do not add an application footer.

## Documentation

Project documentation belongs under `/docs`. Keep only the main `README.md` and this `CONTRIBUTING.md` at repository root. Tool-specific hidden instruction files may remain in their required locations.

## Database-backed changes

Schema, migration, repository and API integration work should use a reachable PostgreSQL database. For local development:

```bash
pnpm env:setup
pnpm db:up
pnpm db:setup
```

Use `pnpm prisma:migrate:baseline:resolve` only when an existing reachable database already contains the baseline schema.
