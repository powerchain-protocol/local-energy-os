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
  energy/       Energy Management System + Local Energy Command Center
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
components/docs @powerchain/docs-ui — shared Docs UI package
programs/       Solana programs
move/           Sui Move package
prisma/         Canonical schema
supabase/       RLS/migration bridge
tools/          Repository verification, infra, Prisma and release tooling
docs/           Canonical project documentation
```

## Brand & application shell

All operational web applications share `@powerchain/ui`. The canonical shell uses a fixed **100dvh** desktop sidebar, independently scrolling grouped navigation, a sticky top bar, responsive drawer behavior, restrained forest-green design tokens, and **no application footer**. Physical infrastructure and operational state are shown before token/network details.

See `docs/DESIGN-SYSTEM.md`. Package versions and upgrade policy are tracked in `docs/PACKAGES.md`.

## Energy Management System

`apps/energy` now exposes the canonical EMS workspace:

```text
Overview                     /

Monitor                      /monitor
├── Live Flow                /monitor/live-flow
├── Generation               /monitor/generation
├── Consumption              /monitor/consumption
└── Storage                  /monitor/storage

Plan & Operate               /operate
├── Forecast                 /operate/forecast
├── Flexibility              /operate/flexibility
├── Dispatch                 /operate/dispatch
└── Grid                     /operate/grid

Context                      /context
├── Markets                  /context/markets
└── Events                   /context/events
```

The dashboard at `/` remains the overview entry, while Monitor, Plan & Operate, and Context use purpose-specific canonical URLs and a shared responsive operational subnavigation. Legacy `/energy/*` URLs redirect to the canonical routes.

The EMS is physical-state-first: live power uses `kW/MW`, accumulated/verified energy uses integer `Wh` with `kWh/MWh/GWh` presentation, and every operational value requires a source timestamp plus freshness/quality state. Missing telemetry remains `UNCONFIGURED`; PowerChain does not derive realtime power, SOC or grid exchange from settlement-grade energy totals. Dispatch follows `Context → Simulate → Policy → Approve → Execute → Verify`. See `docs/EMS.md`.

The Live Flow surface uses a responsive 4/2/1-column site-state grid with a separate power-balance equation, explicit MW/MVAr/MWh/kV/Hz/SOC/°C labeling, source/interval/quality metadata and no horizontal topology canvas. The Energy app uses Tailwind CSS v4 with shadcn-style semantic variables and stable `data-slot` component hooks; shared operational tables reflow into labeled mobile records rather than horizontal scrollers.

## Docs UI workspace boundary

`components/docs` is a first-class workspace package named `@powerchain/docs-ui`. This is required by pnpm strict dependency isolation: shared source outside `apps/docs` must resolve its own React/Next/package dependencies rather than borrowing app-local `node_modules`.

When upgrading to a release that introduces or changes workspace importers, refresh the lockfile once:

```bash
pnpm install --no-frozen-lockfile
```

Commit the resulting `pnpm-lock.yaml`, then use `pnpm install --frozen-lockfile` again for normal development and CI.

## Requirements

- Node.js **24.19.0 LTS** (pinned by `.nvmrc` and `.node-version`)
- pnpm **11.23.0** through Corepack
- PostgreSQL or Supabase PostgreSQL
- Docker optional for local PostgreSQL/Redis
- Anchor/Solana and Sui CLI only when validating blockchain programs

## Install

```bash
nvm use
corepack enable
corepack use pnpm@11.23.0
pnpm install --no-frozen-lockfile
```

The reviewed pnpm build policy is committed in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@prisma/engines': true
  esbuild: true
  prisma: true
  'core-js-pure@3.50.0': false
  '@scarf/scarf': false
```

After the canonical first install, commit the generated `pnpm-lock.yaml`; `pnpm release:verify` intentionally refuses production release verification without it.

The API reference uses the prebuilt `swagger-ui-dist` bundle rather than the React wrapper, which removes the previous Tree-sitter/native parser install-script surface from the API workspace. Keep `@scarf/scarf` denied and review any future install-script additions before approving them.

Recommended verification after install:

```bash
pnpm install --frozen-lockfile
pnpm local-energy:verify
pnpm typecheck
```


### TypeScript runtime profiles

PowerChain separates browser/shared and Node runtime types. `tsconfig.base.json` provides ES2024 + DOM libraries, while `tsconfig.node.json` provides ES2024 plus explicit Node ambient types. Server-only packages such as the worker, auth, database and events layers extend the Node profile.

```json
{
  "compilerOptions": {
    "lib": ["ES2024"],
    "types": ["node"]
  }
}
```

This prevents browser packages from accidentally depending on Node globals while guaranteeing `process`, `Buffer`, Node built-ins and timers are typed in server packages.

### Build cache

Turbo local cache is stored under `cache/turbo` rather than scattered through package directories.

```bash
pnpm cache:status
pnpm cache:clean
```

The cache directory is ignored by Git except for `cache/.gitkeep` and is restored in GitHub Actions.

## Local infrastructure & database bootstrap

PowerChain uses PostgreSQL for canonical transactional state and Redis for asynchronous coordination. Local services are provided through `compose.yaml`; managed PostgreSQL/Supabase and managed Redis are also supported.

The preferred development entry point is:

```bash
pnpm env:setup
pnpm db:status
pnpm db:up
pnpm db:setup
```

`db:up` starts local Compose infrastructure only when the effective database target is local. If `DIRECT_URL`/`DATABASE_URL` points to a managed PostgreSQL service, it performs a reachability check and does not start containers. `db:setup` validates/generates Prisma and creates or applies the development migration history.

Useful infrastructure commands:

```bash
pnpm infra:doctor
pnpm infra:status
pnpm infra:logs
pnpm infra:down

# Destructive: removes local PostgreSQL/Redis volumes.
pnpm infra:reset
```

On macOS, local Compose requires Docker Desktop:

```bash
brew install --cask docker
open -a Docker
docker version
docker compose version
```

If Docker is unavailable, configure a reachable managed PostgreSQL endpoint in `.env.local` and skip local infrastructure.

## Prisma 7, migrations & Supabase

```text
.env.local / CI secrets
  ├── DATABASE_URL        → application runtime
  ├── DIRECT_URL          → Prisma CLI / migrations
  └── SHADOW_DATABASE_URL → optional migrate-dev shadow DB
          ↓
prisma.config.ts
          ↓
prisma/schema.prisma + prisma/migrations/
          ↓
packages/database/src/generated/prisma
          ↓
@prisma/adapter-pg
```

`prisma validate` and `prisma generate` do not require a live database. Migration/status/resolve commands do. The repository therefore separates configuration diagnostics from reachability diagnostics:

```bash
pnpm prisma:doctor   # configuration only
pnpm db:doctor       # requires PostgreSQL to be reachable
```

Common commands:

```bash
pnpm prisma:validate
pnpm prisma:generate
pnpm prisma:migrate:status
```

If `localhost:5432` is not running, `db:doctor` now stops before Prisma and tells you to run `pnpm db:up` or configure `DIRECT_URL`/`DATABASE_URL`.

For a fresh local development database:

```bash
pnpm db:up
pnpm prisma:migrate:init
```

Or use the combined bootstrap:

```bash
pnpm db:setup
```

For later schema changes:

```bash
pnpm prisma:migrate:dev
```

If a **reachable database already contains the schema because it was previously synchronized with `prisma db push`**, create and review a baseline first:

```bash
pnpm prisma:migrate:baseline:create
```

Only after the existing database is reachable and verified to match that baseline should it be marked applied:

```bash
pnpm prisma:migrate:baseline:resolve
pnpm prisma:migrate:status
```

`baseline:create` is offline; `baseline:resolve` is intentionally online because it writes migration history to the database. Do not use `baseline:resolve` to bootstrap an empty or unreachable database.

For staging/production, apply committed migrations only:

```bash
pnpm prisma:migrate:deploy
```

`pnpm prisma:push` remains available only for disposable development synchronization. See `docs/DATABASE.md`.

## Dependency health

A pnpm install warning does not identify the offending peer by itself. Use the repository diagnostic before adding overrides or suppressions:

```bash
pnpm peers:check
```

Do not add broad `peerDependencyRules` merely to hide warnings; resolve or explicitly document the concrete peer relationship first.

## VS Code, Windsurf & AI coding

The repository includes shared editor/agent configuration:

```text
.vscode/
  settings.json
  extensions.json
  tasks.json
  launch.json

.windsurf/rules/powerchain.md
docs/ai/AGENTS.md
.github/copilot-instructions.md
```

VS Code tasks cover installation, verification, infrastructure, Prisma migrations/status/studio and app development. Windsurf and Copilot instructions preserve the same canonical physical-energy, PWRC/wPWRC, Energy RWA, database and UI invariants used by the repository checks.

## Troubleshooting the canonical verification gate

### `Connection url is empty`

Run:

```bash
pnpm env:setup
pnpm prisma:doctor
```

`prisma.config.ts` resolves `.env.local` and `.env` from the repository root and, in non-production environments, falls back to the repository Docker PostgreSQL URL. Production never uses the localhost fallback.

### `workspace-doctor` reports missing `.env.example`

Current validation accepts `.env.example` **or** `.env.local.example`. Pull the latest repository files; the doctor no longer calls `readFileSync(.env.example)` unconditionally.

### `@powerchain/api-client` fails on `error.details`

The API client now normalizes PowerChain error envelopes and non-PowerChain HTTP fallbacks into one `ApiErrorPayload`, so `details` and optional transport request IDs are type-safe.

### Turbo says `no output files found` for library builds

PowerChain libraries currently use typecheck-only `build` scripts and export TypeScript source to workspace consumers. Turbo therefore treats library builds as no-output tasks, while Next.js application tasks separately cache `.next/**`. These warnings should no longer appear.


### Account and authentication UX

The Platform app provides standalone identity routes:

```text
/sign-in
/sign-up
/forgot-password
/reset-password
```

These surfaces preserve the PowerChain trust boundary: account authentication, wallet ownership, organization membership and transaction/dispatch authorization remain separate. Password UI enforces the shared 12–128 character policy and is intentionally fail-closed until a real credential provider is configured; Solana message authentication remains the implemented backend flow.

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
| Realtime WebSocket | 3012 |
| gRPC | 50051 |

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

Start with `docs/README.md`, then `docs/ARCHITECTURE.md`, `docs/DESIGN-SYSTEM.md`, `docs/FULLSTACK.md`, `docs/AUTHENTICATION.md`, `docs/SECURITY.md`, `docs/ASSETS.md`, `docs/API.md`, `docs/SAAS.md`, and `docs/RELEASE.md`.

## Status

The repository is a canonical implementation scaffold with real transactional Energy Ledger APIs, session authentication, tenant/RLS boundaries, outbox/audit infrastructure, SaaS resolution and full-stack application/package structure. Production promotion still requires a Node 24 install with generated lockfile, official Prisma validation, full builds, target-environment integration tests, and Anchor/Sui program validation where applicable.


## UI/UX System

PowerChain applications use the shared `@powerchain/ui` shell with a fixed full-height desktop sidebar, no application footer, restrained forest-green visual language, command search (`⌘/Ctrl+K`), route-aware navigation, responsive mobile action dock, canonical loading/error/empty patterns, and operational lifecycle components. See `docs/DESIGN-SYSTEM.md`. Package versions and upgrade policy are tracked in `docs/PACKAGES.md`.
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


## Repair a partially copied checkout

If the repository was copied with a command that omitted dotfiles, normal verification may report missing VS Code/Windsurf metadata or env templates. Restore non-secret workspace defaults without overwriting existing files:

```bash
pnpm workspace:bootstrap
pnpm env:setup
```

Then run:

```bash
pnpm local-energy:verify
pnpm typecheck
pnpm build:apps
```

`pnpm local-energy:verify` validates the runtime workspace and reports missing editor metadata as warnings. `pnpm release:verify` uses `pnpm doctor:strict` and requires the complete release metadata contract.


## API transports

PowerChain uses `packages/api` as the canonical protocol-contract package. `apps/api` serves REST/OpenAPI on port 3002, `apps/realtime` serves authenticated WebSocket events on port 3012, and `apps/grpc` serves internal gRPC on port 50051. Transactional domain events are published from the worker outbox through Redis. See `docs/API-PLATFORM.md`, `docs/REALTIME.md`, `docs/GRPC.md`, and `docs/POSTMAN.md`.


## Environment and network configuration

PowerChain ships `.env.example`, `.env.local.example`, a safe local `.env.local` for the packaged development scaffold, and environment-specific templates under `env/`. `.env.local` is git-ignored and must never contain production secrets in source control.

Local PostgreSQL uses the standard libpq variables `PGHOST=127.0.0.1`, `PGPORT=5432`, `PGUSER=postgres`, `PGPASSWORD=postgres`, and `PGDATABASE=powerchain`. Canonical Prisma URLs are PostgreSQL URIs such as `postgresql://postgres:postgres@127.0.0.1:5432/powerchain?schema=public`; bare IP addresses and `http://localhost` are not valid Prisma PostgreSQL URLs.

```bash
pnpm env:setup
pnpm db:up
pnpm db:doctor
pnpm prisma:validate
pnpm prisma:generate
```

### Solana / Helius

Development defaults to Solana Devnet. Use `HELIUS_ENABLED=true` plus a server-side `HELIUS_API_KEY` to use Helius RPC; production mainnet must use a dedicated/custom RPC or Helius rather than the public Solana endpoint. PowerChain-owned Energy RWA program IDs are cluster-specific environment values and must be populated after `anchor keys sync` / deployment.

```bash
pnpm solana:doctor
pnpm solana:programs
pnpm solana:devnet
pnpm solana:mainnet
```

The sanitized runtime surface is available from `GET /api/v1/system/solana`. It never returns the Helius API key.

### API transports

Protocol contracts live under `packages/api`: REST/OpenAPI/Swagger, Postman assets, AsyncAPI/WebSocket contracts, and protobuf/gRPC definitions. Deployable gateways remain separate: `apps/api`, `apps/realtime`, and `apps/grpc`.

## System management

The platform exposes canonical system-management surfaces:

```text
GET /api/v1/system/status
GET /api/v1/system/status?probe=deep
GET /api/v1/system/config
GET /api/v1/system/management
```

The Administration app exposes matching System Status, Runtime Config, and Management Policy views. Status never returns database passwords, Helius API keys, private RPC credentials, session secrets, or service-role keys. See `docs/SYSTEM-MANAGEMENT.md`.

## Service modules and isolated backend

See [`docs/SERVICE-MODULES.md`](docs/SERVICE-MODULES.md) for EMS/IoT/DePIN services, provider-neutral adapters, chain/market-data clients, safe actions, hooks and the isolated Express backend.


## Isolated operations backend

EMS, IoT, DePIN, market-data and safe-action preparation run through `apps/backend`, with a dedicated Prisma `operations` schema and explicit `site_access` authorization. `apps/api` is the authenticated gateway. No physical dispatch or settlement execution endpoint is exposed. See `docs/OPERATIONS-BACKEND.md`.
