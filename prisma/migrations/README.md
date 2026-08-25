# PowerChain Prisma Migrations

This directory is the canonical Prisma Migrate history for PowerChain Local Energy OS v1.0.0.

## Create the initial development migration

```bash
cp .env.local.example .env.local
pnpm infra:up
pnpm prisma:doctor
pnpm prisma:migrate:init
```

Prisma 7 does not run `prisma generate` automatically after `migrate dev`; the PowerChain scripts run generation explicitly.

## Create a later migration

```bash
pnpm prisma:migrate:dev
```

Provide a descriptive migration name when Prisma prompts, or run the Prisma CLI directly with `--name`.

## Production / staging

Never run `migrate dev` or `db push` against production. Apply committed migrations only:

```bash
pnpm prisma:migrate:deploy
```

## Supabase

For Supabase, configure:

- `DATABASE_URL`: application/runtime URL (pooled URL is acceptable).
- `DIRECT_URL`: direct or session-mode URL used by Prisma CLI migrations.
- `SHADOW_DATABASE_URL`: optional dedicated development-only shadow database for `migrate dev` when the target account cannot create shadow databases.

Never use a production database as the shadow database.

## Existing database previously synchronized with `db push`

Create a baseline migration from the current Prisma schema:

```bash
pnpm prisma:migrate:baseline:create
```

Review `prisma/migrations/0_init/migration.sql`, then mark it applied only if the target database already contains the equivalent schema:

```bash
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

This is the Prisma Migrate baseline workflow; it prevents the initial migration from trying to recreate tables that already exist.
