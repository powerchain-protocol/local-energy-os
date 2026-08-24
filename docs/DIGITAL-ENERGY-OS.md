# PowerChain Digital Energy OS

## Canonical Full-Stack Architecture — Version 1.0.0

PowerChain Digital Energy OS is the coordination layer between physical electricity infrastructure and digital energy markets.

> **Physical energy remains authoritative. Blockchain provides settlement, representation, interoperability, provenance, and programmable coordination.**

The platform keeps five economic/technical domains explicitly separate:

```text
Electricity
    ≠
Energy RWA
    ≠
Money
    ≠
PWRC
    ≠
wPWRC
```

## Canonical operating flow

```text
MEASURE
  ↓
VERIFY
  ↓
LOCATE
  ↓
PROVE
  ↓
POSITION
  ↓
RESERVE / ROUTE
  ↓
TRADE
  ↓
DELIVER
  ↓
RECONCILE
  ↓
SETTLE
  ↓
RETIRE
  ↓
REWARD
```

## Canonical energy accounting

PowerChain stores physical-energy quantities in integer watt-hours (`Wh`).

```text
1 kWh = 1,000 Wh
1 MWh = 1,000,000 Wh
1 GWh = 1,000,000,000 Wh
```

`kWh` and `MWh` are display/market denominations of the same physical energy. They are not independent crypto assets and are never implicitly convertible to PWRC.

## Full-stack packages

| Package | Responsibility |
|---|---|
| `@powerchain/energy-core` | Wh accounting, evidence, batches, positions, lifecycle and invariants |
| `@powerchain/energy-rwa` | PET-20 metadata, reservations, Solana/Sui representations and backing checks |
| `@powerchain/asset-graph` | Site → Batch → Position → Representation relationships |
| `@powerchain/digital-energy` | Aggregate Digital Energy domain, deterministic demo runtime and summaries |
| `@powerchain/database` | PostgreSQL persistence, idempotency, audit trail and row-locked economic writes |
| `@powerchain/platform` | Dashboard, workspaces and `/api/v1/digital-energy/*` route handlers |

## Persistence modes

Digital Energy uses an explicit runtime data mode.

### LIVE

When `DATABASE_URL` is configured, reads and economic writes use `PostgresDigitalEnergyRepository`.

- Energy quantities are PostgreSQL `BIGINT` in Wh.
- Economic mutations execute in database transactions.
- Position rows are locked for allocation-sensitive writes.
- Idempotency responses are durable.
- Digital Energy audit events are persisted.

If a configured database is unavailable, sensitive writes **do not fall back to memory**.

### DEMO

When no database is configured, the application uses an organization-scoped deterministic in-memory dataset. Every dashboard surface is visibly marked `DEMO`.

### DEGRADED

Read-only demo fallback is opt-in through:

```text
DIGITAL_ENERGY_ALLOW_DEMO_FALLBACK=true
```

This may preserve operator visibility during a database outage, but economic writes continue to fail closed rather than writing to the demo store.

## Tenant boundary

All Digital Energy reads and writes are scoped by the authenticated PowerChain organization. Request and correlation identifiers are propagated in API metadata and audit events.

## API

Canonical namespace:

```text
/api/v1/digital-energy
```

Core endpoints:

```text
GET  /overview
GET  /positions
POST /positions
GET  /positions/:id/backing
POST /positions/:id/reserve
POST /reservations/:id/release
POST /positions/:id/representations
POST /representations/:id/retire
POST /positions/:id/retire
GET  /asset-graph
GET  /standards
GET  /providers
GET  /prices
GET  /reward-epoch
GET  /audit
```

All economic writes require `Idempotency-Key`.

## Dashboard

The main `/` dashboard embeds the Digital Energy Command Center. Dedicated workspaces are available at:

```text
/digital-energy
/energy-rwa
/asset-graph
```

The dashboard never labels demo values as live telemetry. Provider and subsystem state is represented using explicit source/data-mode metadata.

## Provider fabric

Digital Energy surfaces configured market/reference integrations without making them authoritative for physical energy:

- Pyth
- Birdeye
- CoinMarketCap
- ECB/Frankfurter FX
- Solscan
- Suiscan

Oracle/market-data failure must block price-sensitive operations where current pricing is required, but it cannot create or invalidate physical energy by itself.

## Runtime safety

Unsafe combinations such as mainnet writes backed by mock physical data must fail configuration validation. Offline economic actions remain review-first; stale state must never silently issue Energy RWA or retire backing.

## Reward epochs

Reward epochs are configuration-driven. `POWERCHAIN_REWARD_EPOCH_ID`, `POWERCHAIN_REWARD_EPOCH_START`, and `POWERCHAIN_REWARD_EPOCH_END` define the observation window. The endpoint reports eligible verified Wh and epoch state, but returns no PWRC reward amount without an explicit conversion policy. This prevents an implicit energy-to-token exchange rate.

## Canonical v1.0.0 — operational energy lifecycle

Digital Energy OS now carries the canonical Energy Position beyond issuance into physical delivery, reconciliation, and settlement without allowing financial state to become physical evidence.

```text
Physical Infrastructure
        ↓ telemetry
Operational Digital Twin
        ↓
Measure → Verify → Batch → Position
        ↓
Energy RWA / PET-20
        ↓ reserve
Delivery Commitment
        ↓ meter evidence
Physical Delivery
        ↓
Reconciliation
        ↓
Financial Settlement
        ↓
Settled Position
        ↓
Retirement
```

The Operational Digital Twin is observational. It does not mint Energy Positions, increase verified backing, or prove delivery by itself. Physical delivery requires meter evidence. Reconciliation compares committed Wh with meter-delivered Wh using an explicit tolerance. Financial settlement is allowed only after reconciliation, and blockchain confirmation remains a payment/settlement event rather than proof that electricity was delivered.

Canonical v1.0.0 adds these endpoints under `/api/v1/digital-energy`:

```text
GET  /operations
GET  /digital-twin
POST /digital-twin
GET  /deliveries
POST /deliveries
POST /deliveries/:id/record
POST /deliveries/:id/reconcile
GET  /settlements
POST /settlements
POST /settlements/:id/transition
```

The main dashboard now exposes the Digital Twin and the delivery → reconciliation → settlement lifecycle directly. Dedicated operator workspaces are available at:

```text
/digital-energy/twin
/energy-operations
```

See [`DIGITAL-ENERGY-OPERATIONS.md`](./DIGITAL-ENERGY-OPERATIONS.md) for the operational contract, persistence model, authorization boundary, and API semantics.


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
