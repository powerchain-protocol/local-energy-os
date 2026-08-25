# PowerChain Documentation

**Workspace:** `@powerchain/app-docs`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Text-styled product and developer documentation application for the canonical v1.0.0 platform.

## Responsibilities

- architecture docs
- Energy RWA docs
- PWRC/wPWRC docs
- SaaS docs
- API documentation navigation
- shared docs components

## Development

```bash
pnpm --filter @powerchain/app-docs dev
pnpm --filter @powerchain/app-docs typecheck
pnpm --filter @powerchain/app-docs build
```

Local development port: **3009**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
