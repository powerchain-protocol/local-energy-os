# PowerChain EV Charging

**Workspace:** `@powerchain/app-charging`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

EV charging and V2G workspace wired to the charging, grid and settlement domains.

## Responsibilities

- stations/EVSE
- charging sessions
- OCPP/ISO 15118 boundary
- V2G/flexibility
- settlement

## Development

```bash
pnpm --filter @powerchain/app-charging dev
pnpm --filter @powerchain/app-charging typecheck
pnpm --filter @powerchain/app-charging build
```

Local development port: **3007**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
