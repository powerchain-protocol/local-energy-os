# Architecture

```text
Participants / Operators
        ↓
Local Energy OS + SaaS Platform
        ↓
/api/v1 + Context / Policy
        ↓
Energy Proof → Batch → Position → Reservation → Delivery → Retirement
        ↓
Market / Grid / Charging / Plants / Supply Chain
        ↓
Financial Settlement
     ┌──┴──┐
 Solana   Sui
 PWRC     wPWRC
 Energy   Energy representation
 RWA      (supply-preserving)
```

Control-plane configuration, SaaS and identity are isolated from the high-volume telemetry/data plane. External integrations use outbox/reconciliation patterns; optional subsystem failure must not corrupt the canonical Energy Ledger.
