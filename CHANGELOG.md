# Changelog

All notable changes to PowerChain are documented here. The project follows
[Semantic Versioning](https://semver.org/).

## 1.0.0 — 2026-08-21

### Architecture

- Moved the production Next.js application and API routes into `apps/platform`.
- Consolidated configuration, shared contexts, constants, helpers, errors,
  schemas, data, stores, storage, actions, database clients, integrations,
  engineering assets, contracts, infrastructure, programs, scripts, and tests
  under canonical workspace packages.
- Centralized routes and redirects in the platform routing layer.
- Replaced nine placeholder application shells with independently startable web,
  API, checkout, marketplace, AI, integration, explorer, realtime, and worker
  runtimes built on one shared application contract.
- Reduced the repository root to release documents and required toolchain
  configuration; duplicate canonical owners are rejected during validation.

### Platform

- Added the reusable PowerChain UI package and accessible shadcn-style toast
  provider.
- Added GRIDLLM, Proof of Energy, digital-twin, PPA, certification, settlement,
  energy exchange, metering, DePIN, carbon, and marketplace foundations.
- Added role-aware dashboards, project discovery, wallet adapters, AI provider
  configuration, fixed-point PWRC pricing, and signature-gated transactions.
- Added safe legacy redirects, API CORS handling, and an interaction audit that
  rejects placeholder links, nested controls, and buttons without actions.
- Added a responsive public product entry point with a single Command Center
  conversion path, architecture link, readiness panel, and accessible layout.

### Data and integrations

- Moved Prisma and four canonical migrations to `packages/database/prisma`.
- Added PostgreSQL pooling plus Neon and Supabase server/browser/SSR clients.
- Updated Supabase configuration to publishable and secret keys with SSR cookie
  `getAll`/`setAll` adapters.
- Added isolated adapters for Solana, Sui, Cetus, Helius, Pyth, Jupiter, Circle,
  SAP, SCADA, OPC UA, MQTT, LoRaWAN, and related providers.
- Replaced removed Helius and Sui SDK compatibility exports with canonical
  PowerChain integration adapters.

### Toolchain and delivery

- Released all JavaScript workspaces and Rust crates at version `1.0.0`.
- Updated Node typings to 26.2.0, PostgreSQL `pg` to 8.23.0, WebSocket `ws` to
  8.21.3, Rust to 1.98.0, and Anchor crates to 1.1.2.
- Upgraded TypeScript paths, app-owned Tailwind 4/PostCSS configuration, pnpm
  scripts, frozen-lockfile support, Playwright configuration, and smoke tests.
- Rebuilt container assets around Node 24, PostgreSQL 18, Redis 8, and standalone
  Next.js output; upgraded Kubernetes security, probes, rollout, secrets, and TLS.
- Added canonical OpenAPI, PTSP, program security, deployment, architecture,
  integration, and contributor documentation.

## Prerelease history

- `1.0.0-beta.20`: AI package boundaries, engineering framework, PPA catalog,
  certification shell, project discovery, and protocol foundations.
- `1.0.0-beta.19`: PTSP 5.0, Proof of Energy, digital twins, GRIDLLM, carbon
  exchange, ecosystem operations, and program invariants.
- `1.0.0-beta.18`: Tailwind 4 stabilization, environment/network isolation,
  frozen installs, Playwright hardening, and responsive shell updates.
- `1.0.0-beta.17`: domain libraries, provider settings, network status, Anchor
  configuration, and contract validation.
- `1.0.0-beta.16` and earlier: authentication, wallets, energy exchange,
  smart-grid maps, metering, DePIN, payments, legal pages, and initial migrations.

### Digital Energy OS integration — 2026-08-23

- Integrated canonical `@powerchain/energy-core`, `@powerchain/energy-rwa`, `@powerchain/asset-graph`, `@powerchain/digital-energy`, `@powerchain/energy-operations`, and `@powerchain/energy-controls` workspaces directly into the production monorepo.
- Rebuilt the primary dashboard around the Digital Energy Command Center and added `/digital-energy`, `/energy-rwa`, `/asset-graph`, `/digital-energy/twin`, `/energy-operations`, and `/digital-energy/controls`.
- Added canonical integer-Wh Energy Ledger semantics, PET-20 Energy RWA, bounded Solana/Sui representation, reservation-backed delivery, meter evidence, reconciliation, financial settlement and retirement.
- Added PostgreSQL persistence for proofs, batches, positions, reservations, representations, retirements, Digital Twin assets, deliveries, reconciliations, settlements, approvals, idempotency, audit and transactional outbox events.
- Added explicit LIVE/DEMO/DEGRADED semantics. Configured database write failures never fall back to DEMO writes.
- LIVE tenant access requires a normal PowerChain session or a timestamped HMAC-SHA256 trusted-service context.
- Added Pyth, Birdeye, CoinMarketCap, ECB/Frankfurter FX, Solscan and Suiscan presentation boundaries without treating market/oracle data as physical-energy authority.

### Canonical institutional controls and reliability

- Settlement proposals are bound to deterministic `POWERCHAIN_SETTLEMENT_REVIEW_V1` SHA-256 review hashes.
- Maker-checker policy defaults to two distinct checker approvals and prevents a settlement maker from approving their own proposal.
- Any rejection blocks financial submission; `READY → SUBMITTED` requires an approved control state.
- Checker decisions are persisted and bound to the exact reviewed hash.
- Settlement preparation, approval and transition write downstream events through a PostgreSQL transactional outbox.
- Outbox publication uses `FOR UPDATE SKIP LOCKED`, processing leases, stale-claim recovery, bounded concurrency, exponential retry backoff, maximum attempts and HTTP timeouts.
- Event delivery is at-least-once; downstream consumers use the PowerChain event ID as an idempotency key.
- Optional event-sink bearer authentication and HMAC-SHA256 request signing are supported.
- Production non-local event sinks require HTTPS.
- The Institutional Controls dashboard reports actual worker publisher state instead of assuming capability health.
- Financial preparation, control visibility, checker decisions and settlement transitions use narrower institutional authorization boundaries.
- `pnpm digital-energy:validate` is the canonical Digital Energy validation workflow.

### Canonical safety invariants

- Physical energy remains authoritative.
- Electricity, Energy RWA, delivery, money, PWRC and wPWRC remain distinct domains.
- Financial approval does not create energy or prove physical delivery.
- Blockchain confirmation does not prove physical delivery.
- Active Solana + Sui represented Wh cannot exceed canonical Energy Position backing.
- PWRC remains native to Solana; wPWRC remains the 1:1 bridge-backed Sui representation.


### PowerChain Copilot

- Added canonical `@powerchain/copilot` v1.0.0 workspace.
- Replaced scattered operator AI entry points with a unified global PowerChain Copilot.
- Added Ask, Analyze, Research and Act modes.
- Added route-aware context resolution and structured `@Asset`, `@Portfolio`, `@Treasury` and `@Documents` context.
- Added RWA Orchestrator planning and visible specialist-agent activity.
- Added Asset Researcher, Asset Analyst, Risk, Capital, Operator, Verification, Document Intelligence, Reporting, Impact and Launch agents.
- Added reusable asset-analysis, forecast-analysis, anomaly-detection, market-research, document-analysis, RWA-verification, treasury-analysis, funding-analysis, report-generation, workflow-planning and impact-calculation skills.
- Added canonical prompt library and context-specific suggestions.
- Added `/copilot/action-center` for explicit review of AI-prepared work.
- Added organization-isolated PostgreSQL persistence for Copilot action drafts in LIVE mode.
- Added human approval and external wallet-signature state boundaries; Copilot cannot sign transactions.
- Added `/copilot/agents`, `/copilot/skills`, `/copilot/prompts` and `/copilot/settings`.
- Added canonical Copilot registry, plan, run and Action Center APIs.
- Converted legacy `/ai`, `/chat`, and old dashboard AI operator entry points into Copilot redirects/compatibility surfaces.
- Added PowerChain Copilot to the main Digital Energy dashboard.

### PowerChain Products

- Added canonical `/products` portfolio.
- Added Digital Energy OS, PowerChain Copilot, Energy RWA, Local P2P Energy, Infrastructure and Energy Devices as explicit product surfaces.
- Reorganized primary navigation into Operations, Copilot, Products, Commerce, Assets & Edge, Business, References and Administration.


### Copilot architecture presentation improvements

- Added the canonical Copilot architecture diagram to `apps/platform/public/images/architectures/`.
- Added a dedicated `/copilot/architecture` workspace using the same immutable public architecture asset.
- Added responsive architecture presentation for desktop, tablet and mobile.
- Added explicit interface, orchestration, workforce/skills, context, authority and source-of-truth layers.
- Added architecture navigation under the Copilot product group.
- Added architecture links from the Copilot product page and Products overview.
- Updated root README and Copilot/Products documentation to reference the canonical architecture asset and route.


### Local Energy OS

- Added canonical `@powerchain/local-energy` v1.0.0 domain package.
- Promoted Local Energy OS to a first-class PowerChain product.
- Added `/local-energy` command center.
- Added `/local-energy/marketplace` with existing grid-aware P2P marketplace functionality.
- Added `/local-energy/grid` for feeder constraints and flexibility state.
- Added `/local-energy/devices` for meters, DER, storage, EV charging and edge infrastructure.
- Added `/local-energy/settlement` with meter-evidence-first delivery/settlement boundaries.
- Added `/api/v1/local-energy/overview`.
- Kept `/p2p-energy` as a compatibility redirect to the Local Energy marketplace.
- Added Local Energy as a first-class PowerChain Copilot context.
- Updated Products, navigation, README and canonical product documentation.


### Local Energy persistence and lifecycle hardening

- Added canonical integer-Wh `local_energy_*` PostgreSQL models.
- Added tenant-scoped listings, orders, flexibility signals, audit events and durable idempotency records.
- Added advisory transaction locks plus `SELECT ... FOR UPDATE` to prevent listing oversubscription.
- Added idempotent order creation and idempotent order transitions.
- Added evidence-gated order states from `REVIEW_REQUIRED` through `SETTLED`.
- Added meter evidence and reconciliation requirements before financial settlement.
- Added explicit cancellation/dispute paths and early-cancellation capacity release.
- Added persistent grid flexibility requests bounded by available physical capacity.
- Added signed HMAC service context for Local Energy LIVE access.
- Added fail-closed database error semantics.
- Rewired the P2P compatibility APIs to the canonical Local Energy runtime.
- Rewired the marketplace UI to tenant-scoped API data rather than imported demo constants.
- Added fully wired Grid/Flexibility and Settlement operator workspaces.
