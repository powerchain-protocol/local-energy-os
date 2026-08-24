# Canonical migration history

This directory is the only authoritative PowerChain database migration history. Generate migrations with `pnpm prisma migrate dev`, review SQL and tenant indexes, then deploy with `pnpm db:migrate`. Do not create additional root `migration/` or `migrations/` directories.
