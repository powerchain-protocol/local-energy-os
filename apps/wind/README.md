# PowerChain Wind Farms

**Workspace:** `@powerchain/app-wind`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Wind-farm operations workspace for turbines, generation, availability and MWh Energy RWA workflows.

## Responsibilities

- farm/turbine views
- generation status
- availability/curtailment
- MWh Energy RWA
- settlement context

## Development

```bash
pnpm --filter @powerchain/app-wind dev
pnpm --filter @powerchain/app-wind typecheck
pnpm --filter @powerchain/app-wind build
```

Local development port: **3006**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
