# PowerChain Local Energy OS — Full-Stack Architecture

**Canonical version:** 1.0.0

PowerChain is organized into four operational planes.

## Experience plane

`apps/energy`, `apps/platform`, `apps/admin`, `apps/mapper`, `apps/companies`, `apps/grid`, `apps/plants`, `apps/wind`, `apps/charging`, `apps/supply-chain`, and `apps/docs` provide role/context-specific product surfaces.

## Control plane

`apps/api` resolves authentication, tenant/workspace context, policy, SaaS entitlements, validation, idempotency and request correlation. Economic writes fail closed when context or policy is missing.

## Data and execution plane

PostgreSQL/Prisma stores operational state. The worker processes durable outboxes and reconciliation jobs. `/storage` abstracts evidence/report objects; raw high-frequency telemetry remains outside generic blob storage.

Core domain packages include energy accounting, Energy RWA, metering, telemetry, settlement, financial ledger, rewards, grid, plants, wind, charging, geospatial, supply chain, PWRC, cross-chain, x402 and oracles.

## Blockchain plane

PWRC is native to Solana. wPWRC is the 1:1 Sui representation. kWh/MWh Energy RWAs remain backed by canonical integer Wh in the PowerChain Energy Ledger. Solana/Sui representations cannot increase physical supply.

```text
Physical Energy
  ↓
Measurement / Telemetry
  ↓
Energy Proof
  ↓
Energy Batch
  ↓
Energy Position
  ↓
Reservation / Market
  ↓
Delivery
  ↓
Settlement
  ↓
Retirement
```

Every economic mutation writes audit and domain-event outbox records in the same transactional boundary as the authoritative state change.
