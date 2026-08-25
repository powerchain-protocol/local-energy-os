# PowerChain SaaS Platform

**Workspace:** `@powerchain/app-platform`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Control plane for PowerChain tenants, subscriptions, plans, application catalog and entitlement resolution.

## Responsibilities

- tenant administration
- plans and subscriptions
- app catalog
- feature entitlements
- organization access

## Development

```bash
pnpm --filter @powerchain/app-platform dev
pnpm --filter @powerchain/app-platform typecheck
pnpm --filter @powerchain/app-platform build
```

Local development port: **3001**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
