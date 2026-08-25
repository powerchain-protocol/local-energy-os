# PowerChain Companies

**Workspace:** `@powerchain/app-companies`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Energy-company and enterprise customer operational workspace.

## Responsibilities

- company overview
- operational assets
- customer/portfolio context
- settlements
- shared platform/API boundary

## Development

```bash
pnpm --filter @powerchain/app-companies dev
pnpm --filter @powerchain/app-companies typecheck
pnpm --filter @powerchain/app-companies build
```

Local development port: **3003**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
