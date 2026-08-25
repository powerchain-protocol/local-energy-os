# Energy Data Plane

The canonical energy data pipeline is:

```text
Meter / SCADA / EVSE
  ↓
Telemetry envelope
  ↓
Freshness + device verification
  ↓
Physical plausibility
  ↓
Intervalization
  ↓
Energy Proof
  ↓
Energy Batch
  ↓
Energy RWA / settlement
```

`@powerchain/telemetry` classifies live/stale/offline/simulated state. `@powerchain/metering` performs deterministic interval plausibility checks against installed generation and export capacity.

High-frequency raw telemetry belongs in purpose-built time-series/data-lake storage. PostgreSQL remains authoritative for operational entities, proofs, batches, positions, reservations, settlement state, audit, and outbox coordination.
