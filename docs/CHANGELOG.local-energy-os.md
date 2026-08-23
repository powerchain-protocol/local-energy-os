# Local Energy OS Changelog

## 1.0.0 — Canonical Full-Stack Update — 2026-08-23

- Promoted Local Energy OS documentation to canonical full-stack architecture.
- Added SaaS tenant, plan, subscription, app-catalog, feature-entitlement and workspace-context architecture.
- Added participant and operator-role model.
- Added invalidated-energy accounting to physical backing invariants.
- Expanded Energy Position lifecycle with release, dispute, reconciliation and transfer paths.
- Added runtime safety validator and degraded-service policies.
- Added subsystem health model.
- Added Oracle Router with Pyth/Chainlink fail-safe behavior.
- Added x402 agent spend-control policy.
- Added CCTP transfer state model.
- Added SVM and Sui adapter packages.
- Added canonical `move/powerchain/` package boundary and Anchor/Pinocchio program split.
- Added canonical documentation tree under `docs/`.
- Preserved PWRC native Solana configuration and wPWRC 1:1 Sui backing invariant.


### Documentation application

- Added deployable `apps/docs/` Next.js documentation surface.
- Added canonical `docs/WHITEPAPER.md`.
- Added root `CONTRIBUTORS.md`.
- Added whitepaper, architecture, API, Energy RWA, PWRC/wPWRC, SaaS, Solana, Sui, cross-chain, x402, CCTP, oracle, security, and operations routes.
- Added responsive light-theme documentation UI using PowerChain green, neutral gray/black, and Sui blue only for Sui-specific surfaces.
