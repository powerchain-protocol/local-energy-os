# PowerChain Local Energy OS v1.0.0 — Validation Report

**Date:** 2026-08-26  
**Repository policy:** Node.js 24.x + pnpm 11.23.0

## Completed checks

- Workspace doctor: PASS
- Aggregate repository validation: PASS
- Cleanliness/dead-function gate: PASS
- Operations backend static security gate: PASS
- OpenAPI 3.1 route/method coverage: PASS
- OpenAPI YAML + Postman JSON parse: PASS
- Workspace project uniqueness/dependency boundaries: PASS — 61 projects
- Root Markdown policy: PASS — only `README.md` and `CONTRIBUTING.md`
- Repository automation location: PASS — `/tools` only; legacy `/scripts` removed
- API contract source: PASS — `packages/api` only; copied `apps/api/api` removed
- Worker dependency declarations: PASS
- Worker scheduled no-op jobs: NONE
- Worker same-job overlap guard: PASS
- Worker graceful Prisma/Redis shutdown: PASS
- Shared shell dead notification/account controls: REMOVED
- Environment duplicate-key scan: PASS
- Sensitive placeholder credential scan: PASS
- TypeScript/TSX parser pass: PASS — 285 files, 0 syntax errors
- Canonical package-manager contract: PASS — pnpm 11.23.0
- Prisma 7 schema/config structural contract: PASS
- Energy RWA/PWRC accounting invariants: PASS
- Full-height sidebar/no-application-footer invariants: PASS

## Worker runtime contract

Only implemented jobs are scheduled:

- `domain-event-outbox` when `DOMAIN_EVENT_TRANSPORT=log|redis`
- `integration-outbox` when `INTEGRATION_OUTBOX_TRANSPORT=log`
- `idempotency-cleanup`

Meter interval processing, batch finalization, market matching, settlement reconciliation, reward epochs and cross-chain reconciliation remain explicit disabled capabilities until real implementations are wired. They no longer create recurring no-op timers.

## Configuration cleanup

- `components/*` is restored to `pnpm-workspace.yaml`.
- Obsolete Tree-sitter build approvals were removed after migration to `swagger-ui-dist`.
- Database CLI tools share one environment resolver and use `127.0.0.1` consistently for local PostgreSQL.
- Database-touching Prisma commands use `pnpm db:doctor` before invoking Prisma.
- Root scripts now match documented backend, worker, DB, Solana and Postman workflows.

## Dependency baseline

- Next.js 16.3.2
- React / React DOM 19.2.8
- Prisma CLI / Client / PostgreSQL adapter 7.9.1
- TypeScript 7.0.2
- Turborepo 2.10.11
- tsx 4.23.12
- pg 8.23.0
- @types/pg 8.23.1
- @types/node 24.13.3
- @types/react 19.2.18
- swagger-ui-dist 5.32.14
- dotenv 17.4.2

## Target-machine release gates

This packaging environment runs Node 22 and cannot reach the npm registry, so it cannot regenerate `pnpm-lock.yaml` or certify the dependency-bound Node 24/Next/Prisma build. On the canonical release machine run:

```bash
corepack enable
corepack use pnpm@11.23.0
pnpm install --no-frozen-lockfile

pnpm peers:check
pnpm clean:verify
pnpm local-energy:verify
pnpm worker:verify
pnpm backend:typecheck
pnpm backend:build
pnpm typecheck
pnpm build:apps
```

Commit the generated `pnpm-lock.yaml`, then use `pnpm install --frozen-lockfile` for CI/release verification.
