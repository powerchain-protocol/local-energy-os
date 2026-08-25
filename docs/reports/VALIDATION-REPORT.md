# PowerChain Local Energy OS v1.0.0 — Validation Report

**Updated:** 2026-08-25
**Canonical runtime:** Node.js 24.19.0 LTS
**Package manager:** pnpm 11.23.0

## This hardening pass

- Fixed Node ambient type ownership for the worker, auth, database and events packages.
- Added `tsconfig.node.json` with `lib: ["ES2024"]` and `types: ["node"]`.
- Added direct `@types/node` 24.13.3 and TypeScript 7.0.2 development dependencies to Node-runtime workspace packages.
- Replaced `NodeJS.Timeout` in the worker with `ReturnType<typeof setInterval>`.
- Added `.nvmrc` and `.node-version` pinned to Node 24.19.0 LTS.
- Added `.npmrc` engine/package-manager policy and `.npmignore`.
- Added repository-local `cache/turbo`, `pnpm cache:status`, and `pnpm cache:clean`.
- Updated GitHub CI to current action majors with explicit pnpm/Turbo cache.
- Added Dependabot configuration for npm/pnpm and GitHub Actions.
- Added `pnpm toolchain:doctor` to fail early on stale pnpm/TypeScript installations.

## Verified in packaging environment

- Workspace doctor: PASS
- Aggregate repository validation: PASS
- OpenAPI 3.1 HTTP method coverage: PASS
- JSON package/editor configuration parsing: PASS
- Node TypeScript profile resolution (`tsc --showConfig`): PASS
- Node runtime packages extend the Node profile: PASS
- No `NodeJS.*` namespace dependency remains in the worker: PASS
- GitHub CI toolchain policy: PASS
- Cache tooling: PASS
- Workspace projects: 48
- `/api/v1` route modules: 30

## Target-machine release gates

This artifact environment runs Node 22 and cannot install the workspace dependency graph from npm. Run the following on the canonical Node 24.19.0 machine after updating the repository:

```bash
nvm use
corepack enable
corepack use pnpm@11.23.0
rm -rf node_modules cache/turbo
pnpm install --no-frozen-lockfile
pnpm toolchain:doctor
pnpm --filter @powerchain/app-worker typecheck
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

Commit the refreshed `pnpm-lock.yaml`, then return to `pnpm install --frozen-lockfile` for CI and release builds.

## Version policy

The project intentionally remains on Node 24.19.0 LTS. `@types/node` therefore remains on the matching Node 24 type line (24.13.3) instead of the newer Node 26 type package. Type declarations must not advertise runtime APIs unavailable on the deployed Node major.
