# Repository Tools

PowerChain keeps repository automation under `/tools`. Commands are invoked from the repository root through `pnpm`; documentation must not depend on developer-specific absolute paths.

## Tool map

| Tool | Purpose |
| --- | --- |
| `tools/workspace-doctor.mjs` | Workspace structure, package boundary, energy invariant and release metadata checks |
| `tools/validate.mjs` | Aggregate structural and API documentation validation |
| `tools/verify-api-docs.mjs` | OpenAPI route/method and Postman verification |
| `tools/prisma-env.mjs` | Prisma datasource diagnostics |
| `tools/infra.mjs` | Docker/Postgres/Redis preflight and lifecycle |
| `tools/env-setup.mjs` | Non-destructive local environment setup |
| `tools/workspace-bootstrap.mjs` | Restore non-secret editor/AI workspace metadata |
| `tools/release-verify.mjs` | Strict Node 24, lockfile, Prisma, typecheck and app-build release gate |

## Invocation

Use package scripts from the repository root:

```bash
pnpm validate
pnpm local-energy:verify
pnpm infra:doctor
pnpm prisma:doctor
pnpm release:verify
```

Do not add commands that require `cd /Users/...`, a developer username, or a machine-specific checkout location.

## Toolchain and cache

| Tool | Purpose |
| --- | --- |
| `tools/toolchain-doctor.mjs` | Verifies Node 24.19.0, pnpm 11.23.0, TypeScript 7.0.2 and Node 24 typings |
| `tools/cache.mjs` | Reports or clears the repository-local `cache/turbo` build cache |

Use `pnpm toolchain:doctor` before debugging type-resolution failures.

## Database orchestration

```bash
pnpm db:status
pnpm db:doctor
pnpm db:up
pnpm db:wait
pnpm db:setup
pnpm db:down
```

`db:setup` is a development-only bootstrap. It starts local Compose PostgreSQL when the effective datasource is local, waits for reachability, validates/generates Prisma, then creates or deploys migrations as appropriate. Managed PostgreSQL targets are never started/stopped by this tool.

## Dependency diagnostics

```bash
pnpm peers:check
```

Peer warnings must be diagnosed before adding overrides. Do not suppress unknown peer incompatibilities globally.
