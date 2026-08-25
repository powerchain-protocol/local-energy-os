# PowerChain Local Energy OS v1.0.0 — Validation Report

## Status

**PASS for repository/runtime-independent gates.**

This release fixes the Docs application typecheck failure caused by pnpm strict dependency isolation when `apps/docs` compiled source from the root-level `components/docs` directory.

## Root cause fixed

The previous Docs app included `../../components/docs/**/*.tsx` directly in `apps/docs/tsconfig.json`. Those source files are outside the `apps/docs` package boundary, so imports such as `react`, `next/link`, and `@powerchain/ui` were resolved from the root-level component location rather than from the Docs app's local dependency graph. Under pnpm's isolated linker this correctly failed with `TS2307`.

The fix makes `components/docs` a first-class workspace package:

```text
@powerchain/app-docs
        ↓
@powerchain/docs-ui
        ├── @powerchain/shared
        ├── @powerchain/ui
        ├── next (peer + development dependency)
        └── react (peer + development dependency)
```

## Changes validated

- `components/docs/package.json` added with canonical version `1.0.0`.
- `components/docs/tsconfig.json` added for independent Turbo typechecking.
- `components/*` added to `pnpm-workspace.yaml`.
- `apps/docs` now depends on and imports `@powerchain/docs-ui`.
- Direct `../../../components/docs` and `../../../../components/docs` imports removed.
- The external `../../components/docs/**/*.tsx` include was removed from `apps/docs/tsconfig.json`.
- Next.js `transpilePackages` includes `@powerchain/docs-ui`.
- Workspace doctor now validates the Docs UI dependency/peer boundary.
- Aggregate repository validation passes with 48 workspace projects.

## Validation performed

- Workspace doctor: PASS
- Aggregate repository validation: PASS
- OpenAPI route + HTTP-method coverage: PASS
- JSON manifest parsing: PASS
- Docs app direct cross-root import regression check: PASS
- Docs UI workspace dependency contract: PASS
- ZIP integrity: PASS

## Repository counts

- Workspace projects: 48
- Package manifests in release: 48
- `/api/v1` route modules: 30
- Manifest-tracked files: 323

## Required target-machine verification

Because the packaging container does not contain the installed Node 24/pnpm workspace dependencies, the dependency-aware Next.js/React TypeScript gate remains authoritative on the target machine.

The new workspace importer changes the lockfile. Refresh it once:

```bash
pnpm install --no-frozen-lockfile
```

Commit `pnpm-lock.yaml`, then return to the immutable install path:

```bash
pnpm install --frozen-lockfile
pnpm --filter @powerchain/docs-ui typecheck
pnpm --filter @powerchain/app-docs typecheck
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```
