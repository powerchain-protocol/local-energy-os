# PowerChain Local Energy OS

**Workspace:** `@powerchain/app-energy`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Primary participant-facing command center for household, community, company, client and grid-operator contexts.

## Responsibilities

- Energy Command Center
- canonical Wh/kWh/MWh presentation
- Energy RWA and PWRC/wPWRC separation
- context switching
- grid/market/settlement status

## Development

```bash
pnpm --filter @powerchain/app-energy dev
pnpm --filter @powerchain/app-energy typecheck
pnpm --filter @powerchain/app-energy build
```

Local development port: **3000**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
