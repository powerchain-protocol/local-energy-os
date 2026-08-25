# @powerchain/docs-ui

Shared documentation UI for **PowerChain Local Energy OS v1.0.0**.

This directory is a first-class pnpm workspace package because it is intentionally located outside `apps/docs`. Under pnpm's strict dependency isolation, source files resolve framework imports from their own package boundary; therefore React, Next.js, `@powerchain/shared`, and `@powerchain/ui` must not be borrowed implicitly from `apps/docs`.

## Package boundary

```text
apps/docs
   ↓
@powerchain/docs-ui
   ├── @powerchain/shared
   ├── @powerchain/ui
   ├── next (peer)
   └── react (peer)
```

The Docs application provides the Next.js and React peer dependencies. The package keeps matching development dependencies so its own `typecheck` task can run independently in Turbo.

## Components

- `DocsShell`
- `DocPage`
- `DocCallout`
- `DocCardGrid`

## Verification

After adding or changing workspace dependencies, refresh the lockfile once:

```bash
pnpm install --no-frozen-lockfile
```

Then normal verification returns to the immutable lockfile flow:

```bash
pnpm install --frozen-lockfile
pnpm --filter @powerchain/docs-ui typecheck
pnpm --filter @powerchain/app-docs typecheck
pnpm local-energy:verify
```
