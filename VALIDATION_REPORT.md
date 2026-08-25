# PowerChain Local Energy OS v1.0.0 — Validation Report

**Validation date:** 2026-08-25  
**Scope:** full-stack hardening, Energy Ledger transactionality, session authentication, tenant/RLS isolation, SaaS/application wiring, data plane, API contracts, Solana/Sui Energy RWA contracts, worker/release infrastructure, UI/UX operational refinement, and packaging integrity.

## Result

The repository passes the framework-independent validation available in this packaging environment. It is materially upgraded from the earlier scaffold: canonical economic routes are database-backed, mutations are policy-checked and idempotent, audit/outbox records are written in transaction boundaries, Solana wallet authentication persists sessions, secondary applications consume canonical APIs, and Solana/Sui Energy RWA contracts enforce stronger physical-supply invariants.

The artifact is **not declared production-certified** until the final Node 24 / pnpm / Prisma / Next.js / Anchor / Sui gates described below run in the target development environment.

## Passed structural validation

### Workspace doctor

`node scripts/workspace-doctor.mjs` — **PASS**

Validated:

- required canonical paths
- canonical `1.0.0` workspace versions
- duplicate workspace package names
- workspace dependency references
- Wh/kWh/MWh/GWh unit model
- PWRC native-Solana / wPWRC Sui model
- Energy RWA anti-overissuance guard
- canonical `/api/v1` surface
- public-secret exposure checks
- pnpm build-script allowlist
- Prisma 7 client-generation contract
- API documentation artifacts
- economic GET/POST mutation routes
- idempotency infrastructure
- audit + domain-event outbox
- physical infrastructure models
- persisted session authentication
- tenant RLS policies
- hardened Anchor Energy RWA program structure
- hardened Sui Energy RWA module structure

Observed repository package manifests: **47**.

#
## Brand/UI integration validation

The PowerChain v1.0.0 brand reference is now implemented through the shared `@powerchain/ui` package and application layouts.

Validated structurally:

- fixed `100dvh` desktop application sidebar
- independently scrolling grouped sidebar navigation
- no application or documentation footer element
- canonical forest-green / white / light-gray tokens
- shared PowerChain logo lockup and SVG icon system
- responsive sidebar drawer and Escape/body-scroll handling
- shared page header, panel, stat, status and empty-state primitives
- Energy, Platform, Companies, Grid, Plants, Wind, Charging, Supply Chain, Admin, Mapper and API application-shell integration
- Docs retains its documentation-specific full-height sidebar while using the shared brand primitives
- unavailable/live data states remain explicit; the UI does not fabricate telemetry or financial balances

Workspace doctor now enforces `packages/ui`, `docs/DESIGN-SYSTEM.md`, full-height sidebar CSS, the five-part mobile dock, bigint-safe energy presentation, and the no-footer invariant.

### UI/UX operational refinement

Validated in the current pass:

- Local Energy `/`, `/energy`, `/assets`, and `/devices` are real first-class workspace routes.
- Mobile navigation follows `Home · Energy · PowerChain · Assets · More`.
- Overview no longer remains hard-coded active on deeper routes.
- Command palette supports search, Up/Down selection, Enter-to-open and Escape-to-close.
- `DataTable`, `TableToolbar`, `DataValue`, and `FilterPill` are shared UI primitives rather than one-off page markup.
- Energy evidence view consumes canonical Energy Proof and Energy Batch APIs.
- Energy RWA inventory consumes Position, Reservation and Retirement APIs.
- Device inventory presents an explicit unconfigured state instead of fabricated connected equipment.
- `formatEnergy()` uses deterministic bigint quotient/remainder formatting and no longer converts canonical Wh through JavaScript `Number`.

## API/OpenAPI contract

`node scripts/verify-api-docs.mjs` — **PASS**

- OpenAPI version: `3.1.0`
- path coverage: PASS
- HTTP method coverage: PASS
- Postman collection/environment JSON: PASS
- canonical version metadata: PASS

Implemented Next.js API routes under `/api/v1`: **30 route modules**.

### Aggregate repository validation

`node scripts/validate.mjs` — **PASS**

Validated:

- workspace doctor
- method-level API contract coverage
- JSON manifests
- required Prisma models
- economic route wiring

## TypeScript validation available in this environment

Global TypeScript `5.8.3` was used only for framework-independent validation because the packaging environment does not contain the repository's installed Node 24/pnpm dependency graph.

### Syntax transpilation

All `.ts`/`.tsx` sources were parsed/transpiled for syntax errors:

```text
125 TypeScript / TSX source files — PASS
```

### Domain package typechecks

The following framework-independent packages passed `tsc -p <package>/tsconfig.json --noEmit`:

```text
@powerchain/validation
@powerchain/policy
@powerchain/metering
@powerchain/telemetry
@powerchain/settlement
@powerchain/ledger
@powerchain/rewards
@powerchain/energy-core
@powerchain/energy-rwa
@powerchain/pwrc
@powerchain/saas
@powerchain/protocols
@powerchain/cross-chain
@powerchain/oracles
@powerchain/store
@powerchain/storage
```

## Full-stack hardening verified structurally

### Economic API boundary

The Energy Ledger now provides organization-scoped database reads and transactional mutations for:

```text
/api/v1/energy-proofs
/api/v1/energy-batches
/api/v1/energy-positions
/api/v1/energy-reservations
/api/v1/energy-retirements
```

Mutations enforce:

```text
organization context
→ authenticated/session actor
→ centralized policy
→ runtime/write-mode safety
→ JSON/schema validation
→ required Idempotency-Key
→ transactional physical-supply invariant
→ audit record
→ domain-event outbox
```

JSON parsing and idempotency-key validation now execute **inside** the canonical `withApi()` error boundary, so malformed JSON, unsupported media types, missing idempotency keys, and validation errors are normalized through the API response contract instead of escaping into framework-level failures.

### Idempotency

The database-backed idempotency lifecycle reserves the key before economic execution:

```text
new key
→ IN_PROGRESS
→ economic mutation
→ COMPLETED
```

Concurrent reuse of the same key is blocked before a second economic write can run. Payload-hash mismatch is rejected. If the economic operation may have committed but finalization of the idempotency record fails, the record remains `IN_PROGRESS` to fail closed against duplicate execution.

### Authentication/session boundary

Solana wallet authentication now implements:

```text
persisted challenge
→ exact serialized message
→ Ed25519 verification
→ atomic challenge consumption
→ User / LinkedWallet
→ opaque 27-day session token
→ SHA-256 stored session hash
→ HttpOnly SameSite cookie
```

Organization authorization comes from `OrganizationMembership`; wallet ownership does not implicitly grant tenant write authority. Development identity headers are explicitly gated off in production.

Unsafe cookie-auth mutations require a trusted request origin.

### Tenant isolation

Prisma now models users, memberships, sessions, wallet challenges, participants and organization-owned physical/economic resources. Supabase/PostgreSQL RLS policies cover tenant-owned energy and infrastructure tables as defense in depth.

### Energy data plane

Domain packages now encode real invariants for:

- meter physical plausibility
- telemetry freshness
- settlement state transitions
- balanced double-entry journals
- reward-epoch scoring/allocation
- Energy RWA supply controls
- PWRC/wPWRC bridge accounting

### Secondary application wiring

The following applications now consume canonical API endpoints and expose loading/error/unconfigured states instead of relying on fixed demo payloads:

```text
Energy
SaaS Platform
Companies
PowerGrid
Plants
Wind
Charging
Supply Chain
Admin
Mapper
```

### Worker/runtime

The worker contains supervised job registration for:

- domain-event outbox
- integration outbox
- idempotency cleanup
- meter intervals
- Energy Batch finalization
- market matching
- settlement reconciliation
- PWRC reward epochs
- cross-chain reconciliation

Unconfigured pathways report a skipped/reason state rather than pretending execution occurred.

## Prisma 7 architecture

The repository uses the Prisma 7 generation model:

```text
prisma.config.ts
→ prisma/schema.prisma
→ provider = "prisma-client"
→ explicit generated output
→ packages/database/src/generated/prisma
→ @prisma/adapter-pg
→ PostgreSQL / Supabase PostgreSQL
```

The earlier legacy `@prisma/client` import failure is removed from source architecture. Root verification/build commands generate the client before Turbo execution.

## pnpm build-script policy

The reviewed pnpm 11 build policy remains persisted:

```yaml
allowBuilds:
  '@prisma/engines': true
  esbuild: true
  prisma: true
  '@scarf/scarf': false
```

`@scarf/scarf` remains explicitly denied and Scarf analytics are disabled.

## Solana Energy RWA contract hardening

The Anchor program now structurally includes:

- protocol configuration/admin authority
- dedicated verification authority
- explicit Energy Batch creation/finalization
- evidence commitment
- verified/invalidated/positioned/retired Wh accounting
- kWh/MWh unit-alignment checks
- checked arithmetic
- per-position nonce seeds
- reservation/release/retirement
- batch-level retired accounting
- emergency pause/configuration controls

The placeholder program ID must be replaced before deployment.

## Sui Energy RWA contract hardening

The Sui Move package mirrors the canonical supply model with:

- verifier capability
- finalized Energy Batches
- evidence/source fields
- anti-overissuance
- kWh/MWh alignment
- position transfer
- reservation/retirement accounting
- batch-level retired Wh tracking

## API developer tooling

Available artifacts:

```text
apps/api/api/openapi.yaml
apps/api/api/postman/PowerChain-Local-Energy-OS.postman_collection.json
apps/api/api/postman/PowerChain-Local.postman_environment.json
```

Runtime surfaces:

```text
/                 API developer portal
/docs             Swagger UI
/openapi.yaml     OpenAPI 3.1
/api/v1           canonical API namespace
```

## Local/CI infrastructure

The repository includes:

- `compose.yaml` for local PostgreSQL and Redis
- Node 24 GitHub Actions CI
- Prisma validate/generate gates
- full workspace verification/build commands
- strict `release:verify` gate

The generated scaffold intentionally does not fabricate a lockfile. After the first canonical Node 24 / pnpm 11 installation, the generated `pnpm-lock.yaml` must be committed before `pnpm release:verify` can pass.

## Final target-environment gates still required

This packaging container exposes **Node.js 22.16.0** and does not contain pnpm/node_modules, Anchor CLI/Rust, or Sui CLI. Therefore it cannot truthfully certify the following final toolchain gates:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile

pnpm prisma:validate
pnpm prisma:generate
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps

# commit generated pnpm-lock.yaml
pnpm release:verify

anchor build
anchor test
sui move build
sui move test
```

Production promotion should additionally run target-environment database migrations, API integration tests, wallet-auth tests, concurrency/idempotency tests, settlement reconciliation tests, RLS tests, RPC failure tests, and deployment-specific security review.

## UI/UX interaction hardening — 2026-08-25

Implemented and structurally validated:

- fixed `100dvh` desktop application sidebar with independent navigation scrolling;
- no application footer;
- route-aware active navigation state;
- product/current-location breadcrumb in the top bar;
- functional PowerChain command palette with `⌘K`, `Ctrl+K`, `/`, and Escape handling;
- compact mobile action dock with Home, PowerChain command entry point, and More/navigation;
- shared `InlineNotice`, `Skeleton`, `ProgressBar`, `LifecycleStep`, `ActionCard`, and `SectionHeader` primitives;
- refined focus-visible, reduced-motion, responsive, spacing, typography, surface, and status treatments;
- Local Energy Command Center redesigned around the canonical `VERIFIED → POSITIONED → RESERVED → RETIRED` physical-supply lifecycle;
- explicit Energy RWA / PWRC / wPWRC visual separation;
- no fabricated live telemetry, token balance, or wallet state added for visual effect.

Available validation in this packaging environment:

```text
workspace doctor                 PASS
repository aggregate validation PASS
TypeScript parser syntax         PASS (120 TS/TSX files)
no application footer            PASS
full-height sidebar invariant    PASS
```

A dependency-aware React/Next typecheck remains part of the canonical Node 24 + pnpm installation gate because `node_modules` is intentionally not packaged in the release archive.
