# PowerChain Local Energy OS

Version **1.0.0**

PowerChain Local Energy OS is the coordination layer between physical local electricity infrastructure and digital energy markets.

## Product principle

> Physical energy remains authoritative. Blockchain provides settlement, representation, interoperability, provenance, and programmable coordination.

```text
Measure
→ Verify
→ Locate
→ Prove
→ Position
→ Reserve
→ Route
→ Trade
→ Deliver
→ Reconcile
→ Settle
→ Retire
→ Reward
```

The system keeps these domains distinct:

```text
Electricity
≠ Energy Evidence
≠ Energy RWA
≠ Financial Settlement
≠ PWRC
≠ wPWRC
```

## Product surfaces

```text
/local-energy
/local-energy/marketplace
/local-energy/grid
/local-energy/devices
/local-energy/settlement
```

Legacy `/p2p-energy` routes to the canonical Local Energy marketplace.

## Participants

```text
PROSUMER
CONSUMER
CLIENT
GRID_OPERATOR
```

Operator roles include:

```text
ENERGY_COMPANY
UTILITY
AGGREGATOR
PLANT_OPERATOR
WIND_OPERATOR
SOLAR_OPERATOR
CHARGING_OPERATOR
METER_OPERATOR
GRID_OPERATOR
ENERGY_COMMUNITY
```

## Contexts

```text
HOUSEHOLD
COMMUNITY
COMPANY
CLIENT
GRID_OPERATOR
PORTFOLIO
VPP
```

## Local Energy Command Center

The main `/local-energy` workspace exposes:

- community supply and demand;
- net local balance;
- member/prosumer counts;
- local match rate;
- storage/flexibility inventory;
- average local price;
- active market offers;
- delivery authority;
- local market;
- grid and flexibility;
- devices and edge infrastructure;
- settlement status;
- canonical energy flow;
- explicit source-of-truth domains;
- contextual PowerChain Copilot access.

## Grid and flexibility

Local market commitments are constrained by physical limits.

```text
Grid Region
→ Substation
→ Transformer
→ Feeder
→ Connection Point
→ Energy Site
→ Meter
→ DER Asset
```

A requested local export or import cannot exceed:

```text
available physical energy
AND
connection / feeder / grid limit
```

The Local Energy package provides `assertGridConstrainedCommitment` for this boundary.

## Metering and devices

First-class infrastructure includes:

- smart meters;
- solar;
- wind;
- batteries;
- EV charging;
- edge gateways;
- SCADA;
- MQTT;
- OPC UA;
- Modbus;
- OCPP;
- ISO 15118;
- DLMS/COSEM.

Battery discharge creates no new renewable provenance. Provenance follows the charged energy lot and recorded losses.

## Local market

The canonical marketplace supports:

- prosumer sell offers;
- consumer/flexibility buy requests;
- shared battery capacity;
- shared EV charging;
- distance/radius filters;
- renewable source information;
- smart-meter verification;
- financial settlement asset selection.

A listing or order is not proof of energy delivery.

## Delivery and settlement

```text
Reserved
↓
Delivered
↓
Reconciled
↓
Approved
↓
Settled
```

Physical delivery evidence remains upstream of financial settlement.

```text
wallet signature ≠ delivery proof
blockchain confirmation ≠ delivery proof
```

## Energy RWA

Energy RWA is optional.

```text
Verified Energy
→ Canonical Energy Position
→ optional PET-20 representation
```

Cross-chain representation remains bounded:

```text
Active Solana Wh + Active Sui Wh
<=
Canonical Energy Position backing
```

Local Energy never assumes:

```text
1 kWh = 1 PWRC
```

PWRC remains a distinct utility/reward/governance asset.

## Copilot integration

`/local-energy` is a first-class Copilot context.

Suggested operator prompts include:

```text
Explain local energy balance
Analyze local market activity
Check grid flexibility
Review meter delivery
Prepare community energy report
```

Copilot can analyze and prepare work, but cannot replace meter evidence, silently settle funds, or sign wallet transactions.

## API

```text
GET /api/v1/local-energy/overview

GET  /api/v1/p2p/community
GET  /api/v1/p2p/listings
GET  /api/v1/p2p/orders
POST /api/v1/p2p/orders
```

The `/api/v1/p2p/*` namespace remains the current marketplace execution API while `/api/v1/local-energy/*` is the product-level Local Energy OS namespace.

## Canonical internal unit

```text
Wh
```

Conversions:

```text
1 kWh = 1,000 Wh
1 MWh = 1,000,000 Wh
1 GWh = 1,000,000,000 Wh
```

Internal energy accounting should use integer quantities.


## Persistence and tenant isolation

When `DATABASE_URL` is configured, Local Energy OS uses canonical PostgreSQL persistence:

```text
local_energy_listings
local_energy_orders
local_energy_flexibility_signals
local_energy_audit_events
local_energy_idempotency
```

All canonical records are organization scoped.

The current P2P compatibility tables remain for migration/backward compatibility, but new Local Energy OS operations use the integer-Wh canonical tables.

Economic writes fail closed when the configured database is unavailable. They do not silently write into demo state.

### Signed trusted-service context

Optional service-to-service access uses timestamped HMAC-SHA256 authentication:

```env
LOCAL_ENERGY_TRUST_SERVICE_HEADERS=true
LOCAL_ENERGY_SERVICE_HMAC_SECRET=
LOCAL_ENERGY_SERVICE_HMAC_MAX_SKEW_SECONDS=300
```

The canonical signing payload is:

```text
METHOD
PATHNAME
ORGANIZATION_ID
SERVICE_NAME
USER_ID
UNIX_TIMESTAMP
```

Unsigned or stale service headers do not become LIVE tenant authority.

## Atomic market reservation

Order creation is serialized against the listing:

```text
BEGIN
→ advisory transaction lock
→ listing SELECT ... FOR UPDATE
→ idempotency check
→ physical/grid capacity checks
→ integer-micro pricing
→ order insert
→ available Wh decrement
→ COMMIT
```

This prevents concurrent buyers from oversubscribing the same Local Energy capacity.

Order creation starts in:

```text
REVIEW_REQUIRED
```

not in a falsely completed payment state.

## Evidence-gated order lifecycle

```text
REVIEW_REQUIRED
      ↓
RESERVED
      ↓
DELIVERING
      ↓
DELIVERED
      ↓
RECONCILED
      ↓
SETTLEMENT_READY
      ↓
SETTLED
```

Exceptional paths:

```text
CANCELLED
DISPUTED
```

Rules:

- `RESERVED` requires an external reservation/payment/wallet reference.
- `DELIVERED` requires positive delivered Wh and a meter evidence root.
- `RECONCILED` calculates expected-versus-delivered Wh variance.
- `SETTLEMENT_READY` requires meter-evidenced delivery.
- `SETTLED` requires an external settlement reference.
- direct lifecycle jumps are rejected.
- early cancellation releases reserved listing capacity.
- order actions use durable idempotency keys.

## Grid flexibility persistence

Canonical API:

```text
GET  /api/v1/local-energy/flexibility
POST /api/v1/local-energy/flexibility
```

Every request is bounded by:

```text
requestedWh <= availableWh
```

and must have a valid operating time window.

## Canonical API surface

```text
GET  /api/v1/local-energy/health
GET  /api/v1/local-energy/overview
GET  /api/v1/local-energy/listings
POST /api/v1/local-energy/listings
GET  /api/v1/local-energy/flexibility
POST /api/v1/local-energy/flexibility
```

Compatibility market execution remains:

```text
GET   /api/v1/p2p/community
GET   /api/v1/p2p/listings
GET   /api/v1/p2p/orders
POST  /api/v1/p2p/orders
GET   /api/v1/p2p/orders/:id
PATCH /api/v1/p2p/orders/:id
```

All economic POST/PATCH requests require:

```text
Idempotency-Key
```


## Truthful LIVE data state

PowerChain never promotes demo community metrics into LIVE mode.

If PostgreSQL is configured but no live community aggregate/telemetry source is connected:

```text
community.dataState = UNAVAILABLE
community.source = NO_LIVE_COMMUNITY_AGGREGATE_SOURCE

members           = unavailable
localSupplyWh     = unavailable
localDemandWh     = unavailable
matchedPercent    = unavailable
carbonAvoidedKg   = unavailable

telemetry status  = UNAVAILABLE
```

Market listings, Local Energy orders, flexibility requests and settlement state can still be LIVE because those records come from the canonical database.

The UI renders unavailable metrics as:

```text
—
```

rather than `0` or demo values.

This distinction is required because:

```text
no live reading ≠ zero energy
demo reading ≠ live energy
blockchain transaction ≠ physical telemetry
```
