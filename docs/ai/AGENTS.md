# PowerChain Repository Instructions

These instructions apply to AI coding agents operating anywhere in this repository.

## Canonical platform rules

- Product version is `1.0.0`.
- Node is `24.x`; package manager is `pnpm@11.23.0` through Corepack.
- Canonical API namespace is `/api/v1`.
- Physical energy is authoritative. Blockchain state never overrides metering or delivery evidence.
- Internal energy accounting uses integer `Wh` (`bigint`). Never use floating point or coerce canonical Wh through JavaScript `Number`.
- `PWRC` is native to Solana. `wPWRC` is the 1:1 bridged representation on Sui.
- `kWh` and `MWh` Energy RWAs are backed by verified physical energy and must obey anti-overissuance invariants.
- Economic mutations require organization context, authorization/policy, idempotency, audit and outbox behavior.
- Never fabricate telemetry, balances, settlement confirmations, timestamps, transaction IDs, or oracle data.

## Database

- Prisma 7 configuration lives in `prisma.config.ts`.
- Runtime database traffic uses `DATABASE_URL`.
- Prisma CLI/migrations prefer `DIRECT_URL`.
- Use `SHADOW_DATABASE_URL` only for a disposable development shadow database.
- Production uses committed migrations via `pnpm prisma:migrate:deploy`; never `db push`.
- After Prisma schema changes, run `pnpm prisma:validate`, create/update migrations, and run `pnpm prisma:generate`.

## UI

- Use `@powerchain/ui` and the canonical full-height app shell.
- Do not add an application footer.
- Physical/operational state precedes blockchain/token detail.
- Use restrained forest green, white, gray and black. Avoid neon/cyberpunk crypto styling.
- Preserve accessible focus, keyboard navigation, semantic status and responsive mobile behavior.

## Verification

Run the smallest relevant checks during development, then before completion run:

```bash
pnpm doctor
pnpm validate
pnpm api:docs:verify
pnpm prisma:validate
pnpm prisma:generate
pnpm typecheck
```
