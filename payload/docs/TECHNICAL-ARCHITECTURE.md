# Technical Architecture

PowerChain Local Energy OS v1.0.0 is organized around strict domain boundaries: physical energy, evidence, Energy RWA, markets/grid, financial settlement, blockchain settlement, and rewards.

```text
Physical Energy
→ Telemetry / Edge
→ Validation / Energy Proof
→ Energy Batch
→ Energy Position / PET-20 Energy RWA
→ Market / Grid / Flexibility
→ Physical Delivery
→ Reconciliation
→ Financial Settlement
→ Solana / Sui / Cross-Chain
→ Retirement / Provenance / Reward Epoch
```

## Core technical boundaries

- `@powerchain/energy-core` — canonical Wh accounting and lifecycle invariants.
- `@powerchain/energy-rwa` — PET-20 metadata, provenance, evidence, deterministic serialization, representations.
- `@powerchain/local-energy-market` — local order matching constrained by electrical eligibility.
- `@powerchain/local-energy-settlement` — delivery reconciliation and financial ledger helpers.
- `@powerchain/svm` / `@powerchain/sui` — network-specific adapters.
- `@powerchain/cross-chain` — representation allocation, never canonical supply creation.
- `@powerchain/market-data` / `@powerchain/oracles` — Pyth, Birdeye, CoinMarketCap and oracle routing.
- `@powerchain/safe-actions` / `@powerchain/rate-limit` — execution policy and abuse protection.
- `@powerchain/rewards` — PWRC reward epochs independent from physical-energy units.

See `ARCHITECTURE.md` for the full platform diagram and `SECURITY.md` for invariants.
