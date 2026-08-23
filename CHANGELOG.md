# Changelog

All notable changes to PowerChain Local Energy OS are documented here.

## 1.0.0 — 2026-08-23

### Energy RWA

- Added canonical integer Wh accounting with kWh/MWh Energy RWA denominations.
- Added tenant/company-scoped Energy RWA records and authorization checks.
- Added PowerChain PET-20 v1.0.0 metadata with interval, provenance and evidence data.
- Added deterministic JSON serialization and SHA-256 metadata digests.
- Preserved Energy Proof → Batch → Position → Representation supply invariants.
- Added Solana/Sui representation registry with cross-chain over-issuance prevention.
- Added full Energy Position lifecycle through settlement and retirement.

### SaaS / platform

- Added canonical COMMUNITY, PRO, GRID_OPERATOR and ENTERPRISE plans.
- Added API-key generation with one-time secret return and SHA-256 server-side storage model.
- Added API-key revocation, scopes, usage counters, entitlements, quotas and audit persistence schema.
- Added Local Energy platform route and integration registries.

### Networks and explorers

- Added Solscan transaction/account/token URL integration.
- Added Suiscan transaction/account/object/coin URL integration.
- Added PowerChain Explorer integration fragment for Energy RWA representations.

### Market data and oracles

- Added Pyth Hermes v2 latest-price integration and Pyth Oracle adapter.
- Added Birdeye server-side token-price integration.
- Added CoinMarketCap latest-quotes integration.
- Added fixed-point currency-rate normalization, inversion and USD cross-rate processing.

### Security

- Added sliding-window rate-limit policies.
- Added safe-action execution with required idempotency for state-changing actions.
- Added write-mode and scope enforcement for financial, chain-write, bridge and admin operations.
- Added persistence schema for safe-action idempotency and market-rate snapshots.

### Rewards

- Added PWRC reward epochs, verified contributions, deterministic allocation roots and finalization APIs.

### Documentation

- Added canonical whitepaper and deployable `apps/docs` surface.
- Added Energy RWA, market-data, explorer, reward-epoch and safe-action technical documentation.
