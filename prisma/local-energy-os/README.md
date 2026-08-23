# Prisma Integration

The canonical database migration is under `supabase/migrations/`. This folder contains a Prisma model fragment for repositories that use Prisma as the application ORM. Merge the fragment into the repository's canonical Prisma schema or schema-folder configuration; the overlay installer does not silently change an existing Prisma generator/datasource configuration.
