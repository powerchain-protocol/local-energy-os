# API v1

PowerChain exposes a context-aware API under `/api/v1`.

## Context headers

```text
x-request-id
x-correlation-id
x-organization-id
x-tenant-id
x-workspace-id
x-powerchain-context
```

Economic writes also require:

```text
Idempotency-Key
Content-Type: application/json
```

## Energy Ledger

```text
GET/POST /api/v1/energy-proofs
GET/POST /api/v1/energy-batches
GET/POST /api/v1/energy-positions
GET/POST /api/v1/energy-reservations
GET/POST /api/v1/energy-retirements
GET      /api/v1/energy/command-center
```

The API accepts Wh values as integer strings to preserve exactness across JSON runtimes.

## Authentication

```text
POST   /api/v1/auth/solana/challenge
POST   /api/v1/auth/solana/verify
GET    /api/v1/auth/session
DELETE /api/v1/auth/session
```

## SaaS and infrastructure

Participant, SaaS tenant, grid-area, charging, plants, wind farms, supply-chain passports, oracle and cross-chain routes remain under the same canonical namespace.

OpenAPI 3.1 and Postman artifacts live in `apps/api/api/`. `pnpm api:docs:verify` checks both path and HTTP-method coverage against implemented Next.js route handlers.
