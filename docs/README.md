# PowerChain documentation

This directory contains the normative architecture, protocol, conformance, program, security, API, and operations guidance for PowerChain 1.0.0. Machine-readable schemas live in `packages/types/src/schemas`; the canonical public API definition is `docs/api/swagger.yaml` and its generated application copy is `apps/platform/public/openapi.yaml`.

Start with the PPA architecture profile, then consult PTSP for publication rules, PEF for the framework model, and PFB for project governance. Program guidance is under `docs/programs`, security guidance is under `docs/security`, and deployment infrastructure is owned by `packages/infrastructure`.

Cloudflare, Vercel, AWS, Docker, and Kubernetes deployment guidance is in `docs/deployment/CLOUD-PROVIDERS.md`.

## Digital Energy OS

- [`DIGITAL-ENERGY-OS.md`](./DIGITAL-ENERGY-OS.md) — canonical full-stack Digital Energy architecture, persistence modes and APIs.
- [`ENERGY-RWA.md`](./ENERGY-RWA.md) — PET-20 verified Energy Position and Solana/Sui backing rules.
- [`ASSET-GRAPH.md`](./ASSET-GRAPH.md) — canonical Site → Batch → Position → Representation relationship model.

- [Digital Energy Operations](./DIGITAL-ENERGY-OPERATIONS.md) — operational twin, delivery, reconciliation and settlement.

- [`IMPROVEMENTS.md`](./IMPROVEMENTS.md) — canonical v1.0.0 operational, controls, reliability and dashboard improvements.
- [`DIGITAL-ENERGY-CONTROLS.md`](./DIGITAL-ENERGY-CONTROLS.md) — settlement review hashes, maker-checker policy and transactional outbox.

- [`POWERCHAIN-COPILOT.md`](./POWERCHAIN-COPILOT.md) — unified Renewable RWA AI interface, orchestrator, agents, skills and Action Center.

- [`PRODUCTS.md`](./PRODUCTS.md) — canonical PowerChain product portfolio and product relationships.

- [`LOCAL-ENERGY-OS.md`](./LOCAL-ENERGY-OS.md) — communities, P2P markets, grid flexibility, smart metering, devices, delivery and settlement.
