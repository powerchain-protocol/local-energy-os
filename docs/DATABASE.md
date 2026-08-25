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
pnpm env:setup
```

The helper uses `.env.local.example` first and falls back to `.env.example`; it never overwrites an existing `.env.local`.

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

## Troubleshooting

### Prisma reports `Connection url is empty`

This means the Prisma CLI loaded `prisma.config.ts` but received no usable datasource URL. In the current repository, run:

```bash
pnpm env:setup
pnpm prisma:doctor
pnpm prisma:validate
```

`prisma.config.ts` resolves env files relative to the repository root, trims blank `DIRECT_URL`/`DATABASE_URL` values, and provides the local Docker PostgreSQL URL only outside production. If `prisma:doctor` shows a datasource but Prisma still reports an empty URL, confirm that your checkout contains the current `prisma.config.ts` rather than an older scaffold version.

### Validation crashes because `.env.example` is absent

The current workspace doctor accepts either `.env.example` or `.env.local.example`. Missing both is a repository error; missing only `.env.example` is not.
