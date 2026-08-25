# Database, Prisma 7 & Supabase

PowerChain Local Energy OS uses PostgreSQL as the authoritative transactional database and Prisma 7 for schema/client generation. Redis is auxiliary infrastructure; it is not the source of truth for energy, settlement, identity or audit state.

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

`prisma.config.ts` loads `.env.local` before `.env`; shell/CI environment variables retain precedence. Production never silently falls back to localhost.

## Diagnostics

Configuration-only diagnostics:

```bash
pnpm prisma:doctor
pnpm prisma:validate
pnpm prisma:generate
```

Connectivity diagnostics:

```bash
pnpm db:status
pnpm db:doctor
```

`prisma validate` and `prisma generate` do not require a live PostgreSQL server. `migrate status`, `migrate deploy`, `migrate resolve`, `migrate dev`, `db push` and application runtime queries do.

## Local PostgreSQL

The default development target is:

```text
postgresql://postgres:postgres@localhost:5432/powerchain?schema=public
```

Preferred bootstrap:

```bash
pnpm env:setup
pnpm db:up
pnpm db:setup
```

Equivalent lower-level sequence:

```bash
pnpm infra:doctor
pnpm infra:up
pnpm infra:status
pnpm db:doctor
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:init
```

`db:up` waits for the configured local PostgreSQL port before returning. If Docker is unavailable, use a managed PostgreSQL connection instead.

## Fresh database vs baseline

### Fresh database

For a new empty development database, create/apply the initial migration normally:

```bash
pnpm db:up
pnpm prisma:migrate:init
```

### Existing schema created with `prisma db push`

Generate a baseline SQL file offline:

```bash
pnpm prisma:migrate:baseline:create
```

Review `prisma/migrations/0_init/migration.sql`. Only when the **reachable existing database already represents that schema** should the migration be marked applied:

```bash
pnpm db:doctor
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

`baseline:resolve` writes Prisma migration history. It cannot work against a stopped database and must never be used as a substitute for creating an empty database.

## Supabase / managed PostgreSQL

Use separate runtime and migration endpoints when the provider uses a pooler:

```dotenv
POWERCHAIN_DATABASE_MODE=managed
DATABASE_URL="<runtime or pooled PostgreSQL URL>"
DIRECT_URL="<direct/session PostgreSQL URL>"
SHADOW_DATABASE_URL="<optional development-only shadow database URL>"
```

Then:

```bash
pnpm db:doctor
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:status
```

For development schema changes:

```bash
pnpm prisma:migrate:dev
```

For staging/production:

```bash
pnpm prisma:migrate:deploy
pnpm prisma:generate
```

Never use `prisma db push` as the production deployment mechanism.

## P1001 troubleshooting

`P1001: Can't reach database server` is a connectivity failure, not a Prisma schema failure. Check, in order:

1. `pnpm db:status` — confirm the effective host/port.
2. For localhost, start Docker Desktop and run `pnpm db:up`.
3. For managed PostgreSQL, verify `DIRECT_URL`, TLS/pooler mode, VPN/firewall and provider status.
4. Run `pnpm db:doctor` before retrying migration commands.

The migration scripts call `db:doctor` so this problem is reported before Prisma attempts to mutate migration history.
