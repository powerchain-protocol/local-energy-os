# `/storage`

Provider-neutral storage contracts for evidence objects, generated reports, exports, and integration payloads.

Canonical PostgreSQL/Prisma state remains in the database. High-frequency raw telemetry should use a time-series/data-lake path. This directory deliberately avoids coupling domains directly to S3, Supabase Storage, or a single cloud vendor.
