# @powerchain/database

Canonical persistence boundary for Prisma, PostgreSQL (`pg`), Neon, and Supabase SSR/admin clients. The only Prisma schema and migration history are under `prisma`; reusable SQL functions, triggers, views, seeds, and repositories are under `sql`.

Supabase uses publishable and secret keys with cookie `getAll`/`setAll` adapters. Never expose `SUPABASE_SECRET_KEY` to browser code.
