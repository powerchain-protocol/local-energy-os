# Validation Status

The included repository-level doctor validates canonical versions, package-name uniqueness, required paths, API v1 routes, Wh constants and public-secret exposure patterns.

Full production release gates still require the target toolchain and services:

1. Node 24 + pnpm 11.23.0
2. `pnpm install`
3. `pnpm prisma:generate && pnpm prisma:validate`
4. `pnpm typecheck && pnpm build`
5. Anchor build/tests with a real deployed program ID (the scaffold intentionally uses a placeholder ID)
6. Sui Move build/tests with pinned framework revision appropriate for the target network
7. database migration + RLS verification
8. Solana/Sui bridge integration tests
9. secret scan, dependency audit and ZIP integrity verification
