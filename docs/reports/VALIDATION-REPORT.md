# PowerChain Local Energy OS v1.0.0 — Validation Report

## System-management / database hardening pass

Validated in the packaging environment:

- Workspace doctor: PASS
- Workspace projects: 53
- OpenAPI 3.1 method coverage: PASS
- Repository aggregate validation: PASS
- `@powerchain/system-management` TypeScript compile: PASS
- TypeScript/TSX parser: PASS, 190 files, 0 parse errors
- Prisma schema structural contract: PASS through repository validation
- API route manifest coverage: PASS
- Root Markdown policy: PASS (`README.md`, `CONTRIBUTING.md` only)
- Development DB fallback resolution: PASS (`127.0.0.1:5432/powerchain`)
- Database offline classification: PASS (`unreachable`, not `unconfigured`)
- ZIP integrity: generated after this report

## New canonical system surfaces

```text
GET /api/v1/system/status
GET /api/v1/system/status?probe=deep
GET /api/v1/system/config
GET /api/v1/system/management
GET /api/v1/system/health
```

The canonical status contract lives at:

```text
packages/system-management/src/types/status.ts
```

## Database semantics

Prisma schema validation and client generation do not require a live PostgreSQL server. Migration status, migration resolution, `db push`, and migration deployment do.

Datasource resolution:

```text
DIRECT_URL
→ DATABASE_URL
→ PG* variables
→ development-only 127.0.0.1 fallback
```

A derived/configured datasource that cannot be reached is reported as `UNAVAILABLE`. Production has no localhost fallback.

## Target-machine release gates

Run on Node 24.19.0 + pnpm 11.23.0 with installed workspace dependencies:

```bash
pnpm install --frozen-lockfile
pnpm peers:check
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

For migration integration tests, PostgreSQL must also be reachable:

```bash
pnpm db:status
pnpm db:up
pnpm db:doctor
pnpm prisma:migrate:status
```

Anchor/Rust and Sui Move tests remain target-toolchain gates.
