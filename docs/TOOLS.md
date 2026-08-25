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
