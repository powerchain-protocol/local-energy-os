# PowerChain Local Energy OS v1.0.0 — Validation Report

**Release date:** 2026-08-25  
**Workspace projects:** 48  
**API route modules:** 31  
**Manifest-tracked files:** 376

## Passed in packaging environment

- Repository workspace doctor: **PASS**
- Aggregate repository validation: **PASS**
- OpenAPI 3.1 route/method coverage: **PASS**
- Workspace package-name uniqueness: **PASS**
- Workspace import declarations: **PASS**
- Prisma 7 schema contract / multiline enum checks: **PASS**
- Energy accounting / Energy RWA invariant checks: **PASS**
- API economic mutation/idempotency/audit/outbox structural checks: **PASS**
- Auth/session/RLS structural checks: **PASS**
- Solana/Sui RWA hardening structural checks: **PASS**
- Full-height UI shell / no-footer / mobile-nav checks: **PASS**
- Next application loading/error/not-found boundary checks: **PASS**
- Production Next `start` script checks: **PASS**
- Worker emitted-build/start contract: **PASS**
- API client/contracts direct TypeScript typecheck with available compiler: **PASS**
- TypeScript/TSX syntax parse: **PASS — 165 files**
- JSON manifest/editor configuration parse: **PASS**
- Database preflight behavior with unreachable localhost: **PASS**

## Database behavior corrected

`prisma validate` and `prisma generate` are intentionally offline-capable. Commands that require database state now use `pnpm db:doctor` first. `pnpm db:setup` can start/wait for local Compose PostgreSQL or validate a managed PostgreSQL target before migration work begins.

`prisma:migrate:baseline:create` remains offline. `prisma:migrate:baseline:resolve` remains online by design because it writes migration history to an existing database.

## Dependency graph improvement

The API documentation UI now uses `swagger-ui-dist` instead of `swagger-ui-react`. This keeps Swagger/OpenAPI while removing the React wrapper and previous Tree-sitter parser build-script approvals from the workspace policy.

## Required Node 24 release gates

The packaging environment is Node 22 and does not contain the installed pnpm workspace dependency graph. Run these on the canonical Node 24.19.0 / pnpm 11.23.0 machine after refreshing the lockfile:

```bash
pnpm install --no-frozen-lockfile
pnpm peers:check
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
pnpm build:worker
```

For live database validation:

```bash
pnpm db:status
pnpm db:up
pnpm db:setup
pnpm prisma:migrate:status
```

After a successful dependency refresh, commit `pnpm-lock.yaml` and return CI/release installs to `pnpm install --frozen-lockfile`.
