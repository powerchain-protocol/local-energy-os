# Backend application

`apps/backend` is the isolated Node.js/Express backend workspace for PowerChain Local Energy OS.

## Responsibilities

- exposes `/api/v1/health` and `/api/v1/config`;
- owns backend-only Express/CORS/Zod/Supabase dependencies;
- accesses PostgreSQL through `@powerchain/database` and Prisma;
- composes EMS, IoT and DePIN service contracts;
- hosts safe-action execution boundaries;
- can use Solana, Sui and market-data clients without adding those server dependencies to `apps/energy`.

## Commands

```bash
pnpm backend:dev
pnpm backend:typecheck
pnpm backend:build
pnpm backend:start
```

The production build is an esbuild Node 24 ESM bundle under `apps/backend/dist/`. Workspace service code is bundled while external server libraries remain runtime dependencies.

## Security boundary

`GET /api/v1/config` is sanitized. It must never return database credentials, Supabase service-role keys, wallet signing material, RPC API keys or provider secrets. Production CORS origins must be configured explicitly.
