# PowerChain Digital Energy OS — Operational Twin, Delivery, Reconciliation & Settlement

Version 1.0.0 — Canonical v1.0.0

PowerChain now carries the verified-energy model through physical delivery and explicit financial completion:

```text
PHYSICAL ASSET
   ↓ telemetry
OPERATIONAL DIGITAL TWIN
   ↓
VERIFIED ENERGY / ENERGY POSITION
   ↓ reservation
DELIVERY COMMITMENT
   ↓ meter evidence
PHYSICAL DELIVERY
   ↓ variance/tolerance
RECONCILIATION
   ↓ explicit settlement instruction
FINANCIAL SETTLEMENT
   ↓
SETTLED ENERGY POSITION
   ↓
RETIREMENT
```

The boundaries are deliberate:

```text
Telemetry ≠ Energy Proof
Energy Proof ≠ Energy Position
Energy Position ≠ Delivery
Delivery ≠ Money
Blockchain confirmation ≠ physical delivery
PWRC ≠ Wh
```

## Operational Digital Twin

`@powerchain/energy-operations` models asset operating state independently from token or settlement state.

A twin can describe:

- site and grid area;
- asset class;
- observed time;
- telemetry age;
- FRESH / AGING / STALE / UNAVAILABLE freshness;
- OPERATIONAL / DEGRADED / STALE / OFFLINE / MAINTENANCE state;
- active power;
- availability;
- battery state of charge;
- export limit;
- evidence root.

The dashboard never treats a configured capability as measured live health.

## Delivery

A live delivery commitment must reference an **active Energy Reservation**. This prevents a delivery promise from silently creating another allocation of the same canonical Wh.

Delivery states:

```text
COMMITTED
  ↓
DELIVERING
  ↓
DELIVERED
  ↓
RECONCILED
```

Alternatives:

```text
COMMITTED / DELIVERING / DELIVERED → DISPUTED
COMMITTED → CANCELLED
DISPUTED → RECONCILED | CANCELLED
```

Physical delivery requires a meter evidence root.

## Reconciliation

Reconciliation compares:

```text
committedWh
vs
meterDeliveredWh
```

and records an explicit tolerance.

States:

- MATCHED
- WITHIN_TOLERANCE
- REVIEW_REQUIRED
- RECONCILED

Variance is never hidden by settlement.

## Financial settlement

Settlement is prepared only after reconciled physical delivery.

Supported settlement assets in this canonical implementation:

- USDC
- EURC
- FIAT_EUR

Supported settlement environments:

- SOLANA
- OFFCHAIN

Settlement does **not** imply a fixed relationship between energy and PWRC. Settlement amount is explicit input/policy output and does not change canonical Wh backing.

States:

```text
READY → SUBMITTED → CONFIRMED → RECONCILED
                    ↘ FAILED
READY → CANCELLED
FAILED → SUBMITTED | CANCELLED
```

## API

```text
GET  /api/v1/digital-energy/operations
GET  /api/v1/digital-energy/digital-twin
GET  /api/v1/digital-energy/deliveries
POST /api/v1/digital-energy/deliveries
POST /api/v1/digital-energy/deliveries/:id/record
POST /api/v1/digital-energy/deliveries/:id/reconcile
GET  /api/v1/digital-energy/settlements
POST /api/v1/digital-energy/settlements
POST /api/v1/digital-energy/settlements/:id/transition
```

All economic writes require `Idempotency-Key`.

When `DATABASE_URL` is configured, Digital Energy economic writes require an authorized operator role. Trusted service-header authorization is disabled unless explicitly enabled with:

```text
DIGITAL_ENERGY_TRUST_SERVICE_HEADERS=true
```

Only enable this behind an authenticated trusted gateway.

## Persistence

New persistent models:

- DigitalEnergyTwinAsset
- DigitalEnergyDelivery
- DigitalEnergyReconciliation
- DigitalEnergySettlement

Migration:

```text
20260823000200_digital_energy_operations
```

The persistent transaction boundary keeps delivery/reconciliation/settlement writes fail-closed. A configured database failure never falls back to demo writes.


## Tenant authorization

When `DATABASE_URL` enables LIVE mode, tenant reads and economic writes require either a normal authenticated PowerChain session or an explicitly trusted service-gateway context. Arbitrary `x-organization-id` request headers are not accepted as tenant authority in LIVE mode.

Trusted service headers are disabled by default:

```text
DIGITAL_ENERGY_TRUST_SERVICE_HEADERS=false
```

Enable that flag only behind an authenticated gateway that strips untrusted client headers and supplies the organization and service-role context itself. DEMO mode may use request organization headers only to select deterministic isolated demonstration data.


## Concurrent idempotency safety

Economic mutations are not protected only by a unique idempotency table row. PostgreSQL repositories acquire a transaction-scoped advisory lock derived from organization + mutation scope + idempotency key before checking the durable idempotency record and before executing the side effect. This serializes concurrent retries of the same operation and prevents two transactions from both applying the physical/economic mutation before either idempotency record is committed.
