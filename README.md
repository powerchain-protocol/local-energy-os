# PowerChain Local Energy OS

> **Canonical v1.0.0** — full-stack SaaS and energy-infrastructure platform for physical energy, kWh/MWh Real-World Assets, local markets, grid operations, EV charging, PWRC on Solana, wPWRC on Sui, settlement, provenance and machine services.

PowerChain coordinates physical electricity without treating blockchain state as physical reality.

```text
Physical Energy → Metering → Energy Proof → Energy Batch → Energy RWA
      → Market / Grid → Delivery → Reconciliation → Settlement → Retirement
```

## Asset model

| Asset | Canonical authority | Role |
| --- | --- | --- |
| **PWRC** | Solana / Token-2022 | PowerChain utility and rewards |
| **wPWRC** | Sui | 1:1 bridged PWRC representation |
| **kWh RWA** | PowerChain Energy Ledger | Distributed verified energy |
| **MWh RWA** | PowerChain Energy Ledger | Utility-scale verified energy |
| **USDC / EURC** | Financial rails | Settlement |

Internal physical accounting uses integer **Wh**. Active Energy RWA supply cannot exceed verified physical backing.

## Repository

```text
apps/
  energy/       Local Energy OS / Command Center
  platform/     SaaS tenant and entitlement control plane
  admin/        Organizations, memberships, policy, audit and system admin
  mapper/       Grid/infrastructure geospatial workspace
  api/          API v1, Swagger/OpenAPI and Postman
  docs/         Product/developer documentation
  companies/    Energy-company workspace
  grid/         PowerGrid workspace
  plants/       Power-plant operations
  wind/         Wind-farm operations
  charging/     EV charging / V2G
  supply-chain/ Asset passports and provenance
  worker/       Outbox, reconciliation and scheduled jobs

packages/
  ui/           Canonical brand, full-height app shell and UI primitives
  database/     Prisma 7 + PostgreSQL adapter
  auth/         Solana challenge verification + session primitives
  policy/       Role/runtime mutation policy
  validation/   Canonical API input validation
  events/       Domain-event contracts
  audit/        Audit contracts
  energy-core/  Integer Wh arithmetic
  energy-rwa/   kWh/MWh RWA supply invariants
  metering/     Meter interval plausibility
  telemetry/    Telemetry freshness/state
  settlement/   Settlement state machine
  ledger/       Double-entry journal invariants
  rewards/      Reward contribution/epoch allocation
  pwrc/         PWRC/wPWRC bridge accounting
  saas/         Plans/apps/entitlements
  grid/ plants/ wind/ charging/
  geospatial/ supply-chain/
  cross-chain/ x402/ oracles/ protocols/

store/          Workspace client state package
storage/        Provider-neutral evidence/object storage package
components/docs Shared docs UI
programs/       Solana programs
move/           Sui Move package
prisma/         Canonical schema
supabase/       RLS/migration bridge
```

## Brand & application shell

All operational web applications share `@powerchain/ui`. The canonical shell uses a fixed **100dvh** desktop sidebar, independently scrolling grouped navigation, a sticky top bar, responsive drawer behavior, restrained forest-green design tokens, and **no application footer**. Physical infrastructure and operational state are shown before token/network details.

See `docs/DESIGN-SYSTEM.md`.

## Requirements

- Node.js **24.x**
- pnpm **11.22.0** through Corepack
- PostgreSQL or Supabase PostgreSQL
- Docker optional for local PostgreSQL/Redis
- Anchor/Solana and Sui CLI only when validating blockchain programs

## Install

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile
```

The reviewed pnpm build policy is committed in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@prisma/engines': true
  esbuild: true
  prisma: true
  '@tree-sitter-grammars/tree-sitter-yaml@0.7.1': true
  'tree-sitter-json@0.24.8': true
  'tree-sitter@0.21.1 || 0.22.4': true
  'core-js-pure@3.50.0': false
  '@scarf/scarf': false
```

After the canonical first install, commit the generated `pnpm-lock.yaml`; `pnpm release:verify` intentionally refuses production release verification without it.

When `pnpm approve-builds` is shown for the Swagger/OpenAPI parser dependency tree, approve the Tree-sitter native parser packages and leave `core-js-pure` denied. The committed policy is version-pinned so a future parser version must be reviewed again before its install script can execute.

Recommended verification after install:

```bash
pnpm install --frozen-lockfile
pnpm local-energy:verify
pnpm typecheck
```

## Local infrastructure

Local PostgreSQL and Redis are provided through `compose.yaml`. Docker is optional only when you use external services such as Supabase PostgreSQL and a managed Redis endpoint.

Check the local container runtime first:

```bash
pnpm infra:doctor
```

Then start the local services:

```bash
pnpm infra:up
pnpm infra:status
```

Useful commands:

```bash
pnpm infra:logs
pnpm infra:down

# Destructive: removes local Postgres/Redis volumes
pnpm infra:reset
```

On macOS, if `docker` is not found, install/start Docker Desktop before running `infra:up`:

```bash
brew install --cask docker
open -a Docker
docker version
docker compose version
```

If `DATABASE_URL`, `DIRECT_URL`, and `REDIS_URL` point at externally managed services, do not run `pnpm infra:up`.

## Prisma 7

```text
prisma.config.ts
  ↓
prisma/schema.prisma
  ↓
pnpm prisma:generate
  ↓
packages/database/src/generated/prisma
  ↓
@prisma/adapter-pg
```

Useful commands:

```bash
pnpm prisma:validate
pnpm prisma:generate

# Local/development schema synchronization
pnpm prisma:push

# Deployment migrations after migration files are committed
pnpm prisma:migrate
```

## Authentication

Solana wallet authentication is a non-transactional message-signature flow:

```text
challenge → exact message signature → Ed25519 verify → atomic consume
         → LinkedWallet/User → hashed Session → HttpOnly cookie
```

Organization authorization comes from `OrganizationMembership`; wallet ownership alone does not grant tenant write permissions. Dev identity headers are ignored in production.

## Economic API writes

Energy Proofs, Batches, Positions, Reservations and Retirements are now database-backed and transactional. Mutations require:

```text
Organization context
+ authorized role
+ safe runtime/write mode
+ Idempotency-Key
+ validated physical quantity
```

Each successful mutation writes audit and domain-event outbox records.

## API

```text
http://localhost:3002/              API portal
http://localhost:3002/docs          Swagger UI
http://localhost:3002/openapi.yaml  OpenAPI 3.1
http://localhost:3002/api/v1        Canonical namespace
```

`pnpm api:docs:verify` validates **route and HTTP-method coverage** against OpenAPI.

## Development ports

| App | Port |
| --- | ---: |
| Energy | 3000 |
| SaaS Platform | 3001 |
| API | 3002 |
| Companies | 3003 |
| PowerGrid | 3004 |
| Plants | 3005 |
| Wind | 3006 |
| Charging | 3007 |
| Supply Chain | 3008 |
| Docs | 3009 |
| Admin | 3010 |
| Mapper | 3011 |

## Verification

```bash
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

Strict release gate:

```bash
pnpm release:verify
```

It requires Node 24 and a committed lockfile, then runs structural validation, method-level API documentation coverage, Prisma validation/generation, full workspace typechecking and app builds.

## Documentation

Start with `docs/ARCHITECTURE.md`, `docs/DESIGN-SYSTEM.md`, `docs/FULLSTACK.md`, `docs/AUTHENTICATION.md`, `docs/SECURITY.md`, `docs/ASSETS.md`, `docs/API.md`, `docs/SAAS.md`, and `docs/RELEASE.md`.

## Status

The repository is a canonical implementation scaffold with real transactional Energy Ledger APIs, session authentication, tenant/RLS boundaries, outbox/audit infrastructure, SaaS resolution and full-stack application/package structure. Production promotion still requires a Node 24 install with generated lockfile, official Prisma validation, full builds, target-environment integration tests, and Anchor/Sui program validation where applicable.


## UI/UX System

PowerChain applications use the shared `@powerchain/ui` shell with a fixed full-height desktop sidebar, no application footer, restrained forest-green visual language, command search (`⌘/Ctrl+K`), route-aware navigation, responsive mobile action dock, canonical loading/error/empty patterns, and operational lifecycle components. See `docs/DESIGN-SYSTEM.md`.
## Local Energy workspace UX

The Local Energy application now exposes real workspace destinations rather than disabled shell entries:

```text
/          Command Center
/energy    Energy Proofs + verified Energy Batches
/assets    kWh/MWh Energy Positions, reservations and retirements
/devices   Physical-device boundary and configuration state
```

On mobile, the canonical PowerChain dock is:

```text
Home · Energy · [PowerChain] · Assets · More
```

The shared command palette supports search plus `↑` / `↓` selection and Enter-to-open. Operational tables use reusable `@powerchain/ui` primitives and never fabricate telemetry, balances, or connected-device state. Energy display formatting remains bigint-safe end-to-end; large Wh portfolios are formatted without converting the canonical quantity through JavaScript `Number`.

