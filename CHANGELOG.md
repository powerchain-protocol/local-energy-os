# Changelog

## 2026-08-25 — Local infrastructure + Prisma schema recovery

- Fixed Prisma 7 schema parsing by converting all compact one-line enum declarations to canonical multiline enum blocks.
- Added a workspace-doctor regression check that rejects compact inline Prisma enums before `prisma validate` runs.
- Replaced raw Docker shell scripts with `scripts/infra.mjs` infrastructure preflight and lifecycle commands.
- Added `pnpm infra:doctor`, `infra:status`, and `infra:logs`; `infra:up/down/reset` now report missing Docker CLI, missing Compose v2, and unreachable daemon states clearly.
- Updated macOS local-infrastructure documentation and documented external PostgreSQL/Redis mode where Docker is intentionally not used.
- Removed copy/paste-sensitive inline shell comments from Prisma and infrastructure command examples so zsh does not pass `# ...` text through as CLI arguments.


## 2026-08-25 — pnpm build-script policy hardening

- Reviewed the new Swagger/OpenAPI parser build-script prompts produced by `swagger-ui-react` dependencies.
- Approved exact Tree-sitter parser versions required by the current lockfile: `@tree-sitter-grammars/tree-sitter-yaml@0.7.1`, `tree-sitter-json@0.24.8`, and `tree-sitter@0.21.1 || 0.22.4`.
- Explicitly denied `core-js-pure@3.50.0` postinstall execution; PowerChain does not require it for runtime correctness.
- Kept `@scarf/scarf` denied.
- Extended workspace doctor checks so build-script approvals/denials are treated as supply-chain invariants.

## 1.0.0 — UI/UX operational refinement

- Added real Local Energy workspace routes for `/energy`, `/assets`, and `/devices` instead of leaving core navigation disabled.
- Upgraded mobile navigation to the canonical five-part `Home · Energy · PowerChain · Assets · More` dock.
- Fixed route highlighting so Overview is not permanently active on deeper routes.
- Added keyboard selection and Enter-to-open behavior to the PowerChain command palette.
- Added reusable operational `DataTable`, `TableToolbar`, `DataValue`, and `FilterPill` primitives.
- Added Energy Proof / Energy Batch evidence views and Energy RWA Position / Reservation / Retirement inventory views backed by canonical APIs.
- Added an explicit unconfigured Device Inventory UX rather than inventing connected hardware data.
- Replaced `Number(bigint)` energy display conversion with deterministic bigint division/remainder formatting for large Wh portfolios.
- Extended workspace-doctor checks for five-part mobile navigation and bigint-safe energy presentation.

## 1.0.0 — Unified brand and application shell

- Added `@powerchain/ui` as the canonical shared application-shell and UI primitive package.
- Integrated the restrained white/light-gray/forest-green PowerChain brand system across Energy, Platform, Companies, PowerGrid, Plants, Wind, Charging, Supply Chain, Admin, Mapper and API surfaces.
- Replaced fragmented one-off page chrome with a persistent full-height `100dvh` desktop sidebar and mobile drawer.
- Removed the documentation sidebar footer and enforced a no-application-footer policy.
- Added the shared PowerChain logo lockup and non-emoji SVG icon system.
- Refactored core pages to use shared page headers, stat cards, panels, status badges and explicit empty/error states.
- Preserved physical-infrastructure-first hierarchy: Energy RWA, token/network and settlement details remain secondary to operational state.
- Added `docs/DESIGN-SYSTEM.md` and `packages/ui/README.md`; workspace doctor now validates the UI shell and footer invariants.


## 1.0.0 — Repository hardening update

### Tooling

- Persisted pnpm 11 build-script review with `allowBuilds` for `@prisma/engines`, `esbuild`, and `prisma`.
- Explicitly denied `@scarf/scarf` install execution and disabled Scarf analytics.
- Added the canonical `pnpm local-energy:verify` workflow.
- Added `api:docs:verify`, `build:apps`, and Prisma 7-aware root scripts.

### Prisma 7

- Migrated from the legacy `prisma-client-js` generator to `prisma-client` with explicit generated output.
- Added root `prisma.config.ts` and removed datasource URLs/directUrl from `schema.prisma`.
- Added `@prisma/adapter-pg` + `pg` runtime connection architecture.
- Converted `@powerchain/database` to the generated Prisma 7 client path with lazy client construction.

### API developer experience

- Added API developer portal.
- Added Swagger UI and canonical OpenAPI 3.1 contract.
- Added Postman collection and local environment.
- Added automated implemented-route/OpenAPI coverage verification.

### Documentation

- Rebuilt the root README as the canonical monorepo/operator guide.
- Added README files to every application workspace.
- Added root Programs documentation and Energy RWA program documentation.
- Expanded API documentation and local port map.

## 1.0.0
- Canonical Local Energy OS full-stack scaffold.
- SaaS control plane and entitlement package.
- Wh/kWh/MWh/GWh energy accounting.
- Energy Proof/Batch/Position/Reservation/Retirement persistence model.
- Solana-native PWRC and Sui wPWRC bridge invariants.
- Energy RWA anti-overissuance logic.
- Anchor Energy RWA program scaffold and Sui Move lifecycle.
- Context-aware API headers and `/api/v1` resource surface.
- Protocol registry, cross-chain, oracle, x402 and degraded-service abstractions.
- Runtime safety guards and workspace doctor.

### Documentation & shared infrastructure
- Added `apps/docs` canonical documentation application.
- Added reusable root `components/docs` system.
- Added `@powerchain/shared` for stable cross-application primitives and docs metadata.
- Added provider-neutral `/storage` contracts and `/api/v1/system/storage` capability endpoint.
- Added framework-neutral `/store`; Local Energy OS operating context now uses its external store.
- Added DOCS-APP, SHARED, STORAGE and STATE-MANAGEMENT documentation.

## 1.0.0 — Full-stack hardening pass

- Replaced empty Energy Ledger API stubs with organization-scoped Prisma reads and transactional mutations.
- Added canonical validation, policy, audit and domain-event packages.
- Added mutation idempotency records with 24-hour replay handling and payload fingerprint protection.
- Added audit and domain-event outbox persistence in economic transaction boundaries.
- Added persisted Solana wallet challenges, Ed25519 verification, atomic nonce consumption, linked wallets, opaque hashed sessions and HttpOnly cookies.
- Added organization memberships and Supabase/PostgreSQL tenant RLS defense-in-depth policies.
- Added EnergySite, Meter, PowerPlant, WindFarm, ChargingStation, ChargingSession and AssetPassport persistence models.
- Added metering, telemetry, settlement, ledger and reward domain packages.
- Added Admin and Mapper applications.
- Upgraded Energy Command Center from fixed demonstration balances to live database aggregation and explicit unavailable wallet data.
- Upgraded SaaS tenant API from fixed ENTERPRISE payloads to persisted tenant/subscription state.
- Upgraded worker runtime with durable outbox processing, idempotency cleanup, job supervision and graceful shutdown.
- Upgraded OpenAPI/Postman documentation with method-level route verification and Energy Ledger mutation examples.
- Added Docker Compose PostgreSQL/Redis development infrastructure and Node 24 CI/release gates.
- Fixed `/store` and `/storage` as actual pnpm workspace packages.
- Hardened Solana Energy RWA program with config/verification authority, batch finalization, position nonces, unit alignment and batch retirement accounting.
- Hardened Sui Energy Position module with verifier capability, finalized batches, kWh/MWh alignment and mirrored retirement accounting.

### Full-stack correctness follow-up — 2026-08-24

- Moved all JSON body parsing and `Idempotency-Key` validation inside the canonical API execution/error boundary so malformed economic/auth/SaaS/PWRC requests return normalized API failures instead of escaping as framework errors.
- Revalidated method-level OpenAPI coverage for all implemented `/api/v1` route modules.
- Revalidated all TypeScript/TSX source syntax and framework-independent domain package typechecks.
- Confirmed 46 package manifests, 30 `/api/v1` route modules, real API-backed secondary application workspaces, and hardened Energy RWA authentication/idempotency/RLS/program boundaries.

## UI/UX hardening — 2026-08-25

- Added interactive PowerChain command palette with keyboard shortcuts.
- Added automatic route-aware navigation state and top-bar breadcrumbs.
- Added compact mobile PowerChain navigation dock; no application footer introduced.
- Expanded `@powerchain/ui` with shared loading, notice, lifecycle, progress and action components.
- Reworked the Local Energy Command Center around the canonical verified → positioned → reserved → retired Energy RWA lifecycle.
- Added explicit operational priority actions and runtime boundary presentation without fabricated telemetry or wallet balances.
- Refined typography, spacing, status colors, responsive behavior, focus states and surface hierarchy across the shared application shell.
