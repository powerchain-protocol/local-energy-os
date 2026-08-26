# Database, Prisma 7 & Supabase

PowerChain Local Energy OS uses PostgreSQL as the authoritative transactional database and Prisma 7 as the schema/client layer.

## Connection roles

```text
Application runtime
  → DATABASE_URL
  → PostgreSQL / Supabase pooled or direct endpoint

Prisma CLI / migrations
  → DIRECT_URL (preferred)
  → PostgreSQL direct/session endpoint

Development shadow database
  → SHADOW_DATABASE_URL (optional)
  → disposable development-only PostgreSQL database
```

`prisma.config.ts` loads `.env.local` first, then `.env`. Shell and CI environment variables keep precedence.

## Local Docker PostgreSQL

The repository default is:

```text
postgresql://postgres:postgres@localhost:5432/powerchain?schema=public
```

Start local infrastructure:

```bash
pnpm infra:doctor
pnpm infra:up
pnpm infra:status
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Then validate and generate:

```bash
pnpm prisma:doctor
pnpm prisma:validate
pnpm prisma:generate
```

For a **fresh** local database, prefer migrations:

```bash
pnpm prisma:migrate:init
```

If this database already exists because you previously used `prisma db push`, baseline it instead of trying to apply an `init` migration over existing tables:

```bash
pnpm prisma:migrate:baseline:create
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

Review `prisma/migrations/0_init/migration.sql` before resolving it as applied. `baseline:resolve` is only for a database whose existing schema already corresponds to the baseline.

`pnpm prisma:push` remains available for disposable development prototyping only; it does not create migration history.

## Supabase PostgreSQL

Use separate runtime and migration connection strings when a pooler is used:

```dotenv
DATABASE_URL="<runtime or pooled PostgreSQL URL>"
DIRECT_URL="<direct/session PostgreSQL URL>"
SHADOW_DATABASE_URL="<optional development-only shadow database URL>"
```

Do not commit credentials. `.env` and `.env.local` are ignored.

For development migrations:

```bash
pnpm prisma:doctor
pnpm prisma:migrate:dev
```

For staging/production deployments:

```bash
pnpm prisma:migrate:status
pnpm prisma:migrate:deploy
pnpm prisma:generate
```

Production deployments must apply committed migrations. Do not use `prisma db push` as a production deployment mechanism.

## Prisma 7 behavior

Prisma 7 reads the datasource URL from `prisma.config.ts`, not the datasource block in `schema.prisma`. `migrate dev` and `db push` no longer generate Prisma Client automatically, so PowerChain migration scripts run `pnpm prisma:generate` explicitly where appropriate.
