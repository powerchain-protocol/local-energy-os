# PowerChain API

Canonical Next.js API application for PowerChain Local Energy OS v1.0.0.

- Dev port: `3002`
- Namespace: `/api/v1`
- Swagger UI: `/docs`
- OpenAPI: `/openapi.yaml`

## Request boundary

Every domain request receives one request/correlation context. Tenant-owned resources use `x-organization-id` and are independently authorized through the authenticated session membership/policy layer.

Cookie-authenticated unsafe requests enforce trusted Origin validation. Development identity headers are accepted only when explicitly enabled in non-production environments.

## Economic mutations

`POST` operations for Energy Proofs, Batches, Positions, Reservations and Retirements require `Idempotency-Key`, validated integer-string Wh quantities, a safe runtime mode and an authorized role. Successful writes emit audit and domain-event outbox rows in the same database transaction.

## Authentication

```text
POST /api/v1/auth/solana/challenge
POST /api/v1/auth/solana/verify
GET  /api/v1/auth/session
DELETE /api/v1/auth/session
```

Wallet authentication verifies the exact stored challenge message and establishes an opaque HttpOnly session. Wallet ownership alone does not grant organization permissions.
