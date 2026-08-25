# Supabase Integration

PowerChain can use Supabase PostgreSQL, Auth, Realtime and Storage while keeping Prisma as the canonical application schema/client layer.

## Connection model

- `DATABASE_URL`: runtime application connection. A Supabase pooler URL is acceptable where appropriate for the deployment model.
- `DIRECT_URL`: Prisma CLI/migration connection. Prefer a direct connection or Supavisor session-mode connection.
- `SHADOW_DATABASE_URL`: optional disposable development-only database for `prisma migrate dev` when the migration user cannot create a shadow database.

Never point `SHADOW_DATABASE_URL` at production.

## Order of database changes

1. Evolve `prisma/schema.prisma`.
2. Create and review a Prisma migration in `prisma/migrations/`.
3. Apply the Prisma migration.
4. Apply Supabase-specific policies/functions from `supabase/migrations/` when those changes are not representable in Prisma Schema Language, such as RLS policies and `auth.uid()` helpers.
5. Run API/integration validation.

The API still enforces tenant authorization server-side. RLS is defense in depth for approved direct Supabase access paths.

## Existing database baseline

If the database already matches the Prisma schema because `db push` or another schema-management tool was used, create a baseline instead of replaying table creation:

```bash
pnpm prisma:migrate:baseline:create
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

Review the generated baseline before resolving it as applied.
