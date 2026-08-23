# Machine Economy

PowerChain uses x402-compatible policy boundaries for paid machine and API services such as forecasts, grid congestion data, routing, charging availability, verified telemetry, oracle aggregation and optimization jobs.

```text
Agent → API → HTTP 402 → Payment Requirements
→ Policy → Spend Controls → Approved Payment → Service Response
```

Agents remain restricted by payee allowlists, supported networks/assets, service allowlists, per-payment limits, daily budgets, idempotency and required approval thresholds. Machine payments never bypass energy, settlement or runtime safety policy.
