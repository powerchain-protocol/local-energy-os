# PowerChain Power Plants

**Workspace:** `@powerchain/app-plants`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Utility-scale generation workspace for power-plant portfolios and Energy RWA production context.

## Responsibilities

- plant portfolios
- generation units
- capacity and availability
- MWh Energy RWA
- settlement context

## Development

```bash
pnpm --filter @powerchain/app-plants dev
pnpm --filter @powerchain/app-plants typecheck
pnpm --filter @powerchain/app-plants build
```

Local development port: **3005**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
