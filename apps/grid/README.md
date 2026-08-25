# PowerChain PowerGrid

**Workspace:** `@powerchain/app-grid`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Grid-operator workspace for topology, grid areas, constraints and operational context.

## Responsibilities

- grid areas
- substations/transformers/feeders
- operational state
- local market context
- settlement visibility

## Development

```bash
pnpm --filter @powerchain/app-grid dev
pnpm --filter @powerchain/app-grid typecheck
pnpm --filter @powerchain/app-grid build
```

Local development port: **3004**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
