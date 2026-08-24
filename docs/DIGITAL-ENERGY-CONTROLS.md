# PowerChain Digital Energy OS — Institutional Controls

Version 1.0.0

## Purpose

The Institutional Controls layer governs financial settlement execution after physical energy has already been measured, verified, delivered and reconciled.

It does **not** make financial approval authoritative over physical energy.

```text
Physical Electricity
      ↓
Verified Energy
      ↓
Reserved Delivery
      ↓
Meter-Evidenced Delivery
      ↓
Reconciliation
      ↓
Settlement Proposal
      ↓
SHA-256 Review Hash
      ↓
Maker / Checker Approval
      ↓
Network Submission
      ↓
Confirmation
      ↓
Reconciled Settlement
      ↓
Energy Position Settlement / Retirement
```

Canonical separation remains:

```text
Electricity ≠ Energy RWA ≠ Delivery ≠ Money ≠ PWRC ≠ wPWRC
```

## Settlement review hash

Every settlement proposal is bound to:

```text
POWERCHAIN_SETTLEMENT_REVIEW_V1
```

The canonical SHA-256 digest covers:

- settlement ID
- organization ID
- delivery ID
- reconciliation ID
- settlement asset
- settlement network
- exact amount in minor units

An approval is valid only for the exact current review hash.

Any mutation to the reviewed economic proposal therefore requires a new settlement proposal and a new approval cycle.

## Maker-checker policy

Environment:

```env
DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED=2
DIGITAL_ENERGY_MAKER_CHECKER_REQUIRED=true
```

Default institutional policy:

- 2 distinct checker approvals
- settlement maker cannot satisfy a checker approval
- each actor may act only once on a settlement
- any rejection blocks submission
- only `READY` settlements accept approval decisions
- `READY → SUBMITTED` fails unless the control state is `APPROVED`

The allowed financial rails remain:

```text
Assets:
USDC
EURC
FIAT_EUR

Networks:
SOLANA
OFFCHAIN
```

This policy is independent from physical Energy RWA representation on Solana/Sui.

## Control states

```text
PENDING
  ├── APPROVED
  └── REJECTED
```

`APPROVED` means the financial proposal passed the configured institutional approval policy. It does not mean energy was delivered.

## Transactional outbox

Settlement preparation, approvals and lifecycle transitions write a downstream event into PostgreSQL inside the same transaction as the state change.

Topics include:

```text
digital-energy.settlement.prepared
digital-energy.settlement.approval
digital-energy.settlement.transitioned
```

This prevents the classic failure mode:

```text
database commit succeeds
+
message publish fails
=
lost downstream event
```

Instead:

```text
database transaction
  ├── state mutation
  └── durable outbox event
          ↓
worker claim
          ↓
HTTP event sink
          ↓
published / retry
```

### Delivery semantics

Outbox publication is **at-least-once**.

Every downstream consumer must use:

```text
x-powerchain-event-id
```

or the JSON `eventId` as an idempotency key.

The publisher also sends:

```text
Idempotency-Key
x-powerchain-event-id
x-powerchain-event-topic
```

## Worker reliability

The outbox publisher supports:

- `FOR UPDATE SKIP LOCKED`
- bounded batch size
- bounded concurrency
- processing leases
- stale lease recovery
- exponential retry backoff
- maximum attempts
- HTTP request timeout
- no publication when no sink is configured
- disabled operation when no database is configured

A worker crash after claiming an event does not strand it permanently. A stale `PROCESSING` lease becomes claimable again.

Retry delay starts at 15 seconds and is exponentially increased up to one hour.

## Event sink security

Configuration:

```env
POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_URL=
POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_TOKEN=
POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_SIGNING_SECRET=

DIGITAL_ENERGY_OUTBOX_INTERVAL_MS=5000
DIGITAL_ENERGY_OUTBOX_BATCH_SIZE=25
DIGITAL_ENERGY_OUTBOX_CONCURRENCY=4
DIGITAL_ENERGY_OUTBOX_MAX_ATTEMPTS=10
DIGITAL_ENERGY_OUTBOX_LEASE_SECONDS=300
DIGITAL_ENERGY_OUTBOX_HTTP_TIMEOUT_MS=10000
DIGITAL_ENERGY_OUTBOX_POOL_MAX=3
```

In production, a non-local event sink must use HTTPS.

When `POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_SIGNING_SECRET` is configured, the worker signs the exact HTTP request body with HMAC-SHA256:

```text
x-powerchain-signature: sha256=<hex digest>
```

The sink should calculate HMAC-SHA256 over the raw request body and compare using a constant-time equality function.

The bearer token and HMAC secret are server-only credentials.

## Manual worker execution

The worker exposes an internal manual cycle endpoint:

```text
POST /api/v1/jobs/digital-energy-outbox/run
```

It is disabled unless:

```env
POWERCHAIN_WORKER_ADMIN_TOKEN=
```

is configured.

When configured, the request must provide:

```text
Authorization: Bearer <POWERCHAIN_WORKER_ADMIN_TOKEN>
```

The periodic publisher itself does not require this token.

## Control plane API

```text
GET  /api/v1/digital-energy/controls
POST /api/v1/digital-energy/settlements/:id/approval
```

The control-plane read model exposes:

- approval policy
- settlement review hashes
- maker identity
- required approvals
- approved/rejected checker identities
- control state
- pending/failed outbox events

## Operator workspace

The platform includes:

```text
/digital-energy/controls
```

The workspace shows:

- checker queue
- exact review hash
- settlement maker
- approval progress
- maker-checker status
- rejection state
- outbox reliability state

Approval actions use a new `Idempotency-Key`.

## Persistence

Prisma models:

```text
DigitalEnergySettlement
DigitalEnergySettlementApproval
DigitalEnergyOutboxEvent
```

The outbox record carries:

- state
- attempts
- last error
- next retry time
- processing lease start
- creation time
- publish time

## Security boundary

Approval permission is separately enforced by the Digital Energy server.

LIVE mode requires an authenticated PowerChain session or explicitly trusted service context. The approval role boundary is intentionally narrower than generic Digital Energy read access.

## Invariants

```text
Financial approval does not create energy.

Financial approval does not prove delivery.

Blockchain confirmation does not prove delivery.

A rejected settlement cannot be submitted.

A maker cannot satisfy the checker requirement.

Approvals are bound to the exact SHA-256 review hash.

Outbox delivery may repeat; consumers must be idempotent.

Physical Energy Ledger state remains authoritative for Wh.
```


## Publisher health in the dashboard

The Institutional Controls page can resolve the actual workers-service publisher state instead of assuming that a configured capability is operational.

Configure the platform server with:

```env
POWERCHAIN_WORKERS_URL=http://127.0.0.1:3108
```

The platform reads:

```text
GET /api/v1/jobs/digital-energy-outbox
```

and reports one of:

```text
UNCONFIGURED
DISABLED
UNAVAILABLE
DEGRADED
OPERATIONAL
```

If the workers URL is not configured, the dashboard explicitly reports `UNCONFIGURED`; it does not fabricate an operational state.


## Signed service-gateway context

LIVE service-to-service access uses timestamped HMAC-SHA256 authentication when `DIGITAL_ENERGY_TRUST_SERVICE_HEADERS=true`.

The canonical signing payload is:

```text
METHOD
PATHNAME
ORGANIZATION_ID
SERVICE_NAME
USER_ID
UNIX_TIMESTAMP
```

Configure:

```env
DIGITAL_ENERGY_SERVICE_HMAC_SECRET=
DIGITAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS=300
```

PowerChain validates the signature with constant-time comparison and rejects stale timestamps. Trusted headers without a valid signature do not become tenant authority.
