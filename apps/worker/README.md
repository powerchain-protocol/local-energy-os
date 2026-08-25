# PowerChain Worker

**Workspace:** `@powerchain/app-worker`  
**Version:** `1.0.0`  
**Runtime:** Node.js service

Asynchronous processing service for Energy Ledger, settlement, rewards and integration reconciliation.

## Responsibilities

- meter interval jobs
- energy-batch finalization
- market matching
- settlement reconciliation
- PWRC reward epochs
- SAP/outbox processing
- cross-chain reconciliation

## Development

```bash
pnpm --filter @powerchain/app-worker dev
pnpm --filter @powerchain/app-worker typecheck
pnpm --filter @powerchain/app-worker build
```

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
