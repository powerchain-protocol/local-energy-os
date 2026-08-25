# Storage Architecture

The root `/storage` boundary defines provider-neutral object storage for evidence, reports, exports and integration payloads.

- PostgreSQL/Prisma remains canonical transactional state.
- High-frequency telemetry belongs in time-series/data-lake infrastructure.
- Energy evidence objects can use storage with content hashes and evidence roots referenced by canonical Energy Proof records.
- Providers implement the `ObjectStorage` contract; domains do not import a specific cloud SDK directly.

`GET /api/v1/system/storage` exposes non-secret storage capabilities for operational inspection.
