# Package Baseline

Verified stable package baseline for PowerChain Local Energy OS v1.0.0 on 2026-08-25.

| Package | Version | Policy |
| --- | ---: | --- |
| pnpm | 11.23.0 | Canonical package manager via Corepack |
| Node.js | 24.19.0 LTS | Canonical production/runtime contract |
| Next.js | 16.3.2 | Latest stable |
| React | 19.2.8 | Latest stable |
| React DOM | 19.2.8 | Latest stable |
| Prisma CLI | 7.9.1 | Latest stable |
| Prisma Client | 7.9.1 | Latest stable |
| Prisma PostgreSQL adapter | 7.9.1 | Keep aligned with Prisma |
| TypeScript | 7.0.2 | Latest stable |
| Turborepo | 2.10.11 | Latest stable |
| tsx | 4.23.12 | Latest stable |
| Better Auth | 1.6.29 | Latest stable |
| pg | 8.23.0 | Latest stable |
| @types/pg | 8.23.1 | Latest stable |
| @types/node | 24.13.3 | Latest Node 24 type line; intentionally not Node 26 typings |
| @types/react | 19.2.18 | Latest stable |
| swagger-ui-react | 5.32.14 | Latest stable |
| @types/swagger-ui-react | 5.18.0 | Current published type package |
| dotenv | 17.4.2 | Latest stable |

## Upgrade policy

- Prefer current stable releases; do not use canary, beta, RC, or integration tags in the canonical branch.
- Keep Prisma CLI, client, and adapter on the same version.
- Keep React and React DOM aligned.
- Keep Node type definitions on the Node 24 line while the runtime engine remains Node 24.x.
- A package-manager or workspace-importer change requires regenerating and committing `pnpm-lock.yaml` on Node 24.
- Run `pnpm approve-builds` only for newly introduced install scripts and review them before adding to `allowBuilds`.

## TypeScript profiles

- `tsconfig.base.json`: ES2024 + DOM for shared/browser code.
- `tsconfig.node.json`: ES2024 + `types: ["node"]` for Node runtime code.
- Node-runtime packages must declare `@types/node` directly because pnpm uses strict dependency isolation.
- Do not upgrade `@types/node` to a newer runtime major until the project Node engine moves to that major.
