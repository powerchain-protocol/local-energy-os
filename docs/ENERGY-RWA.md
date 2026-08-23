# Energy RWA

The authoritative accounting unit is integer **Wh**. `1 kWh = 1,000 Wh`, `1 MWh = 1,000,000 Wh`, and `1 GWh = 1,000,000,000 Wh`.

A kWh Energy RWA is intended for households, prosumers, local energy communities, EV charging, batteries, P2P markets, commercial sites, community solar, and distributed renewables. MWh Energy RWAs are intended for wind farms, solar farms, utilities, power plants, industrial customers, aggregators, VPPs, and energy companies.

## Proof → Batch → Position

```text
Meter Reading → Validation → Physical Plausibility → Quality Scoring → Energy Proof → Energy Batch → Energy Position
```

Energy Proofs preserve site, meter, source, interval, measured Wh, verified Wh, quality score, evidence root, verifier, and verification version.

## Physical-Supply Invariant

```text
Issued / represented active energy
+
Reserved energy
<=
Verified physical energy
-
Invalidated energy
```

The same invariant is enforced at API, database, Solana, Sui, market, and cross-chain boundaries.

## Position Lifecycle

```text
AVAILABLE → RESERVED → COMMITTED → DELIVERING → DELIVERED → SETTLING → SETTLED → RETIRED
RESERVED → RELEASED → AVAILABLE
SETTLING → DISPUTED → RECONCILED → SETTLING/SETTLED
AVAILABLE → TRANSFERRED → AVAILABLE/RESERVED
```

Retirement reasons: `CONSUMED`, `SETTLED`, `CERTIFIED`, `INVALIDATED`, `CANCELLED`, `MIGRATED`.
