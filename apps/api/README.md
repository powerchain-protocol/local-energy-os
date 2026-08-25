# PowerChain API

**Package:** `@powerchain/app-api`  
**Version:** `1.0.0`  
**Development port:** `3002`

## Purpose

Canonical `/api/v1` service plus OpenAPI, Swagger UI and Postman developer surface.

## Product boundary

This application is a presentation/orchestration surface. Authoritative physical energy, permissions, financial state and Energy RWA supply are resolved through server-side APIs and domain packages. The UI must never invent telemetry, balances, settlement state or blockchain confirmation.

## Primary dependencies

- `/api/v1/*`
- `/openapi.yaml`
- `/docs`

## Shared architecture

- `@powerchain/ui` — canonical full-height application shell and design tokens.
- `@powerchain/api-client` — request/correlation/workspace-aware API transport where applicable.
- `@powerchain/contracts` — stable request/context/wire contracts.
- PostgreSQL/Prisma and policy checks remain server-side.

## UX rules

1. Physical/operational state appears before token/network details.
2. Loading, empty, unconfigured, degraded and error states are explicit.
3. Desktop sidebar is full-height; operational apps do not render a footer.
4. Status is never conveyed by color alone.
5. Mock/simulated data must be visibly identified and cannot authorize live writes.

## Development

```bash
pnpm --filter @powerchain/app-api dev
pnpm --filter @powerchain/app-api typecheck
pnpm --filter @powerchain/app-api build
```

From the repository root, run the full gate with:

```bash
pnpm local-energy:verify
pnpm build:apps
```
