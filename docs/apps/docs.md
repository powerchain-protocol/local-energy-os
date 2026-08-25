# PowerChain Documentation

**Package:** `@powerchain/app-docs`  
**Version:** `1.0.0`  
**Development port:** `3009`

## Purpose

PowerChain product, architecture, API, database, program and operating documentation site.

## Product boundary

This application is a presentation/orchestration surface. Authoritative physical energy, permissions, financial state and Energy RWA supply are resolved through server-side APIs and domain packages. The UI must never invent telemetry, balances, settlement state or blockchain confirmation.

## Primary dependencies

- `/architecture`
- `/api`
- `/energy-rwa`

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
pnpm --filter @powerchain/app-docs dev
pnpm --filter @powerchain/app-docs typecheck
pnpm --filter @powerchain/app-docs build
```

From the repository root, run the full gate with:

```bash
pnpm local-energy:verify
pnpm build:apps
```

## Shared documentation components

The application consumes `@powerchain/docs-ui` from `components/docs/`. Do not import `../../../components/docs` directly. The package boundary is required for pnpm strict dependency isolation and gives the shared Docs UI its own React/Next peer contract.
