# Toolchain and Configuration

PowerChain Local Energy OS v1.0.0 uses an explicit, reproducible Node/TypeScript toolchain.

## Runtime

- Node.js: 24.19.0 LTS
- pnpm: 11.23.0 via Corepack
- TypeScript: 7.0.2
- Turborepo: 2.10.11
- Prisma: 7.9.1

Use the repository version files instead of machine-specific paths:

```bash
nvm install
nvm use
corepack enable
corepack use pnpm@11.23.0
```

`.nvmrc` and `.node-version` both pin Node 24.19.0. NVM does not define a standard `.nvmignore` file; repository/package exclusions belong in `.gitignore` and `.npmignore`.

## TypeScript profiles

`tsconfig.base.json` is the shared/browser profile:

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"]
  }
}
```

`tsconfig.node.json` is the server profile:

```json
{
  "compilerOptions": {
    "lib": ["ES2024"],
    "types": ["node"]
  }
}
```

The worker, auth, database and event packages extend the Node profile and declare `@types/node` directly. This is required under pnpm strict dependency isolation.

The project intentionally uses `@types/node` 24.13.3 while running Node 24.19.0. Do not use Node 26 type declarations on the Node 24 runtime merely because a newer runtime-major type package exists.

## Local build cache

Turborepo cache is kept in `cache/turbo`.

```bash
pnpm cache:status
pnpm cache:clean
```

Only `cache/.gitkeep` is tracked.

## Toolchain diagnostics

```bash
pnpm toolchain:doctor
pnpm exec tsc --version
pnpm --version
node --version
```

The toolchain doctor fails early when an old checkout is still using pnpm 11.22.x or TypeScript 5.9.x.

## GitHub Actions

CI uses current GitHub action majors, Node from `.nvmrc`, Corepack-managed pnpm, a committed lockfile and a cache for both the pnpm store and `cache/turbo`. Dependabot monitors npm/pnpm workspace dependencies and GitHub Actions weekly.

## Database reachability preflight

Use `pnpm db:doctor` before commands that require a live PostgreSQL server. Migration, push, reset, and migration-status commands invoke this check automatically. In development, an unconfigured datasource resolves to `postgresql://postgres:postgres@localhost:5432/powerchain?schema=public`; that fallback is configuration only and does not start PostgreSQL. Start local services with `pnpm infra:up`, or configure `DIRECT_URL`/`DATABASE_URL` for a managed database.
