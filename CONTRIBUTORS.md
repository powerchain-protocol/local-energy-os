# Contributors

Thank you for improving PowerChain.

## Contribution workflow

1. Create a focused branch and keep changes inside the package that owns the capability.
2. Add or update tests in `packages/tooling/tests` or the affected package.
3. Run `pnpm validate`, `pnpm typecheck`, and `pnpm build` before requesting review.
4. Update `CHANGELOG.md` for user-visible behavior, migrations, APIs, or dependency changes.

## Repository rules

- Keep workspace versions aligned at `1.0.0` for this release line.
- Do not recreate deprecated root `src`, `database`, `programs`, `scripts`, `tests`, or infrastructure folders.
- Keep schemas in `packages/types/src/schemas` and database migrations in `packages/database/prisma/migrations`.
- Use the route catalog in `packages/configuration/src/config/routes.ts` and safe redirect helpers.
- Reuse `packages/ui` primitives; accessible names, focus states, keyboard behavior, and functional actions are required.
- Never commit credentials, private keys, seed phrases, generated builds, or local environment files.

By contributing, you agree that your work may be distributed under the repository's license.

## Digital Energy canonical rules

Contributions touching energy accounting, Energy RWA, settlement, dashboards, or chain representations must preserve these invariants:

- Physical energy is authoritative.
- Internal energy accounting uses integer Wh.
- kWh/MWh are denominations, not independent crypto assets.
- Energy RWA cannot exceed verified physical backing.
- Active Solana + Sui representation Wh cannot exceed the canonical Energy Position.
- PWRC is native to Solana; wPWRC is its 1:1 bridge-backed Sui representation.
- PWRC/wPWRC are not units of electricity.
- Blockchain payment confirmation is not proof of physical delivery.
- A configured live database must never silently fall back to an in-memory write path.
- Offline economic actions require fresh review before execution.
