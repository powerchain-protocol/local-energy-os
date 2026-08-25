# PowerChain Local Energy OS v1.0.0 — Validation Report

**Validation date:** 2026-08-25  
**Scope:** Prisma environment recovery, verification-script hardening, API client type fix, Turbo output policy, README/contracts/program upgrades.

## Fixed in this pass

- `scripts/workspace-doctor.mjs` no longer crashes when `.env.example` is absent; it accepts `.env.example` or `.env.local.example` and fails only if both are missing.
- `prisma.config.ts` now resolves `.env.local`/`.env` from the repository root, trims blank URL values and preserves the development-only local PostgreSQL fallback.
- Added `pnpm env:setup` to create `.env.local` without overwriting an existing file.
- Fixed `@powerchain/api-client` TS2339 on `error.details` by normalizing PowerChain and generic HTTP failures to `ApiErrorPayload`.
- `@powerchain/contracts` is now split into API, request-context, energy and bridge contracts with stable package exports.
- Turbo library builds are declared as no-output tasks; Next application builds retain `.next/**` output caching, removing misleading package `no output files found` warnings.
- Expanded all application READMEs and added `packages/contracts/README.md`, `docs/CONTRACTS.md` and `docs/PROGRAMS.md`.
- Upgraded the Anchor Energy RWA program with emitted reconciliation events and verifier-controlled batch invalidation that cannot undercollateralize issued positions.

## Checks executed in this artifact environment

```text
Workspace doctor                                  PASS
Repository aggregate validation                   PASS
OpenAPI 3.1 HTTP-method coverage                  PASS
.env.example-missing fallback simulation          PASS
Prisma environment diagnostic                     PASS
@powerchain/contracts TypeScript                  PASS
@powerchain/api-client TypeScript                 PASS
VS Code/root JSON configuration                   PASS
Canonical package manifests                       47
Application READMEs                               13
All repository READMEs                            23
/api/v1 route modules                             30
```

The Prisma diagnostic with no local env files resolves:

```text
environment: development
DIRECT_URL: not configured
DATABASE_URL: not configured
CLI datasource: postgresql://localhost:5432/powerchain
```

## Target-machine rerun

Your Node.js 24.19.0 + pnpm 11.22.0 environment is the canonical runtime. After applying this release:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --frozen-lockfile

pnpm env:setup
pnpm prisma:doctor
pnpm prisma:validate
pnpm prisma:generate

pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

If local PostgreSQL/Redis are required:

```bash
pnpm infra:doctor
pnpm infra:up
pnpm infra:status
```

If using Supabase/managed PostgreSQL, set `DATABASE_URL` and `DIRECT_URL` in `.env.local` and skip local Docker infrastructure.

## Migration policy

Fresh development database:

```bash
pnpm prisma:migrate:init
```

Existing database previously synchronized with `prisma db push`:

```bash
pnpm prisma:migrate:baseline:create
# review prisma/migrations/0_init/migration.sql
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

Staging/production:

```bash
pnpm prisma:migrate:status
pnpm prisma:migrate:deploy
```

Do not use `db push` as a production deployment mechanism.

## Remaining target-toolchain gates

The packaging container does not include the workspace-installed Next.js/Prisma toolchain, PostgreSQL, Anchor or Sui CLI. Therefore the authoritative full Turbo/Next build, live DB connectivity, Anchor compile/tests and Sui Move tests remain target-machine release gates.
