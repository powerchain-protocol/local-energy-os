# PowerChain monorepo ownership

PowerChain 1.0.0 uses one owner for each cross-cutting concern. Application pages and route handlers live in `apps/platform`; reusable implementation lives in a package.

| Concern | Owner |
| --- | --- |
| Next.js routes, pages, high-level components | `apps/platform` |
| Routes, redirects, environment, network and cluster configuration | `packages/configuration` |
| Context, common components, constants, helpers and errors | `packages/shared` |
| UI primitives and toast notifications | `packages/ui` |
| Types and validation schemas | `packages/types` |
| Catalogs, state stores and storage | `packages/data` |
| Actions and action manifest | `packages/actions` |
| Prisma, SQL, PostgreSQL, Neon and Supabase | `packages/database` |
| External provider boundaries | `packages/integration` |
| WebSocket server and realtime contracts | `packages/websocket` |
| Anchor/Rust programs | `packages/programs/anchor` |
| Docker, Kubernetes and Terraform | `packages/infrastructure` |
| Checks, scripts and tests | `packages/tooling` |

## Invariants

- Workspace and Cargo release versions are `1.0.0`.
- `packages/types/src/schemas` is the only schema tree; `packages/database/prisma/migrations` is the only migration tree.
- Root product source, database, program, test, script, contract, engineering, integration, and infrastructure copies are forbidden.
- Routes come from `packages/configuration/src/config/routes.ts`; redirects are derived from `LEGACY_REDIRECTS` and validated before navigation.
- Shared packages declare their runtime and workspace dependencies explicitly so strict pnpm installs remain reproducible.
- `pnpm validate` and `pnpm duplicates:check` enforce these boundaries.
