# Database adapters

PowerChain supports Prisma ORM for typed domain persistence, Neon HTTP for low-latency serverless SQL, and Supabase SSR for cookie-aware authentication and Postgres access. `prisma/migrations/` is the only authoritative migration history. Application code imports database adapters from `@/lib/database` and never reads service-role credentials in client components.
