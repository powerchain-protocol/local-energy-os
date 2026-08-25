# PowerChain Supply Chain

**Workspace:** `@powerchain/app-supply-chain`  
**Version:** `1.0.0`  
**Runtime:** Next.js 16

Energy-infrastructure provenance workspace for asset passports and lifecycle tracking.

## Responsibilities

- asset passports
- equipment provenance
- EPCIS-oriented events
- installation/maintenance state
- blockchain evidence references

## Development

```bash
pnpm --filter @powerchain/app-supply-chain dev
pnpm --filter @powerchain/app-supply-chain typecheck
pnpm --filter @powerchain/app-supply-chain build
```

Local development port: **3008**.

## Architecture rules

- Import shared business rules from `@powerchain/*` domain packages; do not duplicate domain invariants in the app.
- Keep tenant/context authorization server-side. UI visibility is not authorization.
- Preserve the canonical `1.0.0` application version and `/api/v1` contract.

See the root `README.md` and `docs/ARCHITECTURE.md` for the platform architecture.
