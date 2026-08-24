# PowerChain Digital Energy OS — Canonical Improvements

Version **1.0.0**

PowerChain uses one canonical product version. Internal implementation revisions are not exposed as product-version suffixes.

## Operating architecture

```text
Physical Infrastructure
        ↓
Telemetry / Meter Evidence
        ↓
Operational Digital Twin
        ↓
Validated Energy Proof
        ↓
Finalized Energy Batch
        ↓
Canonical Energy Position
        ↓
Energy RWA / PET-20
        ↓
Reservation
        ↓
Physical Delivery
        ↓
Reconciliation
        ↓
Settlement Proposal
        ↓
Review Hash + Maker/Checker
        ↓
Financial Settlement
        ↓
Retirement
```

Cross-chain representation remains parallel to the authoritative physical-energy lifecycle:

```text
Canonical Energy Position
        ├── Solana / PET-20
        └── Sui / PET-20

Active Solana Wh + Active Sui Wh
<=
Canonical Energy Position backing
```

## Improvements included in v1.0.0

### 1. Exact settlement review contract

Financial proposals are bound to:

```text
POWERCHAIN_SETTLEMENT_REVIEW_V1
SHA-256(
  settlementId,
  organizationId,
  deliveryId,
  reconciliationId,
  asset,
  network,
  amountMinor
)
```

Approvals are valid only for the exact digest.

### 2. Maker-checker controls

Default policy:

```env
DIGITAL_ENERGY_SETTLEMENT_APPROVALS_REQUIRED=2
DIGITAL_ENERGY_MAKER_CHECKER_REQUIRED=true
```

Controls enforce:

- distinct checker identities;
- maker cannot approve their own proposal;
- one decision per actor per settlement;
- any rejection blocks submission;
- only `READY` proposals accept control decisions;
- `READY → SUBMITTED` requires an approved control state.

### 3. Transactional outbox

Settlement preparation, approval and transition events are written in the same PostgreSQL transaction as the domain mutation.

```text
Database mutation
      +
Durable outbox event
      ↓
Worker claim
      ↓
Event sink
```

Delivery semantics are **at-least-once**. Consumers must use the PowerChain event ID as an idempotency key.

### 4. Outbox crash recovery

The worker supports:

- `FOR UPDATE SKIP LOCKED`;
- processing leases;
- stale `PROCESSING` recovery;
- bounded concurrency;
- exponential retry backoff;
- maximum attempts;
- request timeout;
- explicit failed-event state.

### 5. Event-sink security

Production non-local sinks require HTTPS.

Optional security:

```env
POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_TOKEN=
POWERCHAIN_DIGITAL_ENERGY_EVENT_SINK_SIGNING_SECRET=
```

When the signing secret is configured, the exact HTTP body is signed using HMAC-SHA256 and emitted in:

```text
x-powerchain-signature: sha256=<digest>
```

### 6. Narrow financial authorization

General Digital Energy write authority is not enough for institutional settlement control.

LIVE financial preparation, checker decisions, controls visibility and state transitions use narrower company/admin/super-admin or explicitly trusted-service boundaries.

### 7. Truthful worker health

The Institutional Controls workspace never assumes a worker is operational.

With:

```env
POWERCHAIN_WORKERS_URL=http://127.0.0.1:3108
```

the platform resolves:

```text
UNCONFIGURED
DISABLED
UNAVAILABLE
DEGRADED
OPERATIONAL
```

### 8. Dedicated control-plane workspace

```text
/digital-energy/controls
```

provides:

- exact review hash;
- maker identity;
- checker progress;
- approved/rejected state;
- maker-checker status;
- outbox backlog;
- publisher state;
- explicit approve/reject actions.

### 9. DEMO without weakening LIVE

DEMO mode can select explicit demo checker identities so maker/checker flows can be demonstrated.

LIVE mode continues to use authenticated PowerChain identity or an explicitly trusted service gateway.

### 10. Canonical release verification

Use:

```bash
pnpm digital-energy:validate
```

after installing the repository with its canonical Node/pnpm toolchain.

## Non-negotiable invariants

```text
Physical energy remains authoritative.

Electricity ≠ Energy RWA ≠ Delivery ≠ Money ≠ PWRC ≠ wPWRC.

Financial approval does not create energy.

Financial approval does not prove delivery.

Blockchain confirmation does not prove delivery.

Energy RWA <= verified physical backing.

Active Solana Wh + Active Sui Wh <= canonical Energy Position backing.

PWRC is native to Solana.

wPWRC is the 1:1 bridge-backed Sui representation of PWRC.
```


## Signed trusted-service context

Trusted service headers are no longer sufficient by themselves.

When service-gateway access is enabled:

```env
DIGITAL_ENERGY_TRUST_SERVICE_HEADERS=true
DIGITAL_ENERGY_SERVICE_HMAC_SECRET=
DIGITAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS=300
```

the gateway signs:

```text
METHOD
PATHNAME
ORGANIZATION_ID
SERVICE_NAME
USER_ID
UNIX_TIMESTAMP
```

using HMAC-SHA256.

Required headers:

```text
x-organization-id
x-powerchain-service-role
x-user-id
x-powerchain-service-timestamp
x-powerchain-service-signature
```

Unsigned, expired, malformed, or incorrectly signed service context is treated as unauthenticated in LIVE mode.


## PowerChain Copilot integration

PowerChain Copilot is the canonical operator intelligence layer above Digital Energy OS product domains.

```text
Operator
   ↓
PowerChain Copilot
   ↓
RWA Orchestrator
   ↓
Scoped specialist agents
   ↓
Reusable skills
   ↓
Digital Energy OS / Energy RWA / Treasury / Projects / Documents
   ↓
Reviewable result or action draft
   ↓
Human approval
   ↓
External wallet signature if required
```

Copilot does not become an alternative source of energy, financial, settlement or chain truth. Product APIs and authoritative evidence remain the source of record.

The AI gateway exposes whether actual provider execution occurred. When no provider/data connector is configured, Copilot reports a safe orchestration-only fallback rather than claiming analysis completed.


## Local Energy OS persistence and market hardening

The canonical v1.0.0 Local Energy product now uses its own integer-Wh persistence boundary instead of relying on static P2P catalog objects.

### Canonical persistence

```text
local_energy_listings
local_energy_orders
local_energy_flexibility_signals
local_energy_audit_events
local_energy_idempotency
```

Migration:

```text
20260824000200_local_energy_os
```

### Concurrency-safe reservations

```text
BEGIN
→ pg_advisory_xact_lock
→ listing SELECT ... FOR UPDATE
→ idempotency validation
→ available/grid capacity validation
→ integer-micro price calculation
→ order insert
→ available Wh decrement
→ COMMIT
```

This prevents two concurrent requests from allocating the same physical energy capacity.

### Evidence-gated settlement

```text
REVIEW_REQUIRED
→ RESERVED
→ DELIVERING
→ DELIVERED
→ RECONCILED
→ SETTLEMENT_READY
→ SETTLED
```

Direct settlement jumps are rejected.

`DELIVERED` requires positive delivered Wh and meter evidence.

`SETTLEMENT_READY` is impossible before reconciliation.

`SETTLED` requires an external payment, accounting or transaction reference.

### Durable idempotency

Economic writes require `Idempotency-Key`.

Repeating the exact request is safe. Reusing the same key with a different listing, order or flexibility payload raises:

```text
LOCAL_ENERGY_IDEMPOTENCY_CONFLICT
```

### Truthful LIVE data

A configured database does not cause demo community metrics to be relabeled as live telemetry.

Without a configured live aggregate telemetry source:

```text
community.dataState = UNAVAILABLE
telemetry            = UNAVAILABLE
```

The dashboard renders these values as unavailable rather than `0` or demo values.

### Fully wired operator surfaces

The following workspaces now consume the Local Energy APIs:

```text
/local-energy
/local-energy/marketplace
/local-energy/grid
/local-energy/settlement
```

Grid & Flexibility reads/writes canonical flexibility signals.

Settlement advances orders through the evidence-gated lifecycle and records only externally created wallet/payment references.
