# PowerChain Local Energy OS — v1.0.0

**Canonical Full-Stack Platform Documentation**  
Local Energy • Smart Metering • SaaS • Energy RWA • Solana • Sui • Machine Economy

This additive monorepo overlay implements the canonical Local Energy OS domain model and documentation for an existing PowerChain pnpm workspace.

## What is wired

- integer Wh accounting with kWh/MWh display/RWA denominations
- Energy Measurement → Proof → Batch → Position → Reservation → Delivery → Settlement → Retirement
- physical backing and invalidation invariants
- P2P local market matching with grid-capacity constraints
- PWRC native on Solana
- wPWRC 1:1 bridge representation on Sui
- cross-chain Energy RWA allocation invariant
- SaaS tenant / plan / subscription / entitlement resolver
- context-aware request propagation
- runtime safety validation and degraded-service policies
- Pyth / Chainlink Oracle Router boundary
- x402 agent spend policy
- CCTP transfer state model
- SVM and Sui adapter packages
- platform app catalog / navigation
- API routes and Supabase migrations
- canonical split documentation under `docs/`

## Non-negotiable invariants

1. Physical energy is authoritative.
2. Every Energy RWA traces to verified physical evidence.
3. `PWRC != Wh != kWh != MWh`.
4. PWRC is native Solana; wPWRC is 1:1 bridge-backed on Sui.
5. Cross-chain Energy RWA representations never exceed canonical backing.
6. Blockchain payment confirmation is not physical delivery proof.
7. Agents cannot bypass policy, spend controls, simulation, or required approval.

## Apply to a PowerChain monorepo

```bash
node scripts/local-energy-os/apply.mjs /path/to/powerchain
```

Then:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile
pnpm local-energy:doctor
pnpm local-energy:verify
pnpm local-energy:build
pnpm typecheck
```

See `docs/LOCAL-ENERGY-OS.md` for the canonical platform architecture.

## Prisma and tooling

`prisma/local-energy-os/` provides a non-invasive Prisma model fragment; `tooling/local-energy-os/` contains protocol capability and runtime policy declarations. The Supabase migrations remain the canonical executable database migrations in this overlay.


## Documentation application

`apps/docs/` is the canonical deployable documentation surface.

```bash
pnpm --filter @powerchain/docs dev
pnpm --filter @powerchain/docs build
```

The docs app renders canonical source files from `docs/`, including `docs/WHITEPAPER.md`.

Contribution guidance is available at [`CONTRIBUTORS.md`](./CONTRIBUTORS.md).
## Energy RWA, explorers, market data and safety

The v1.0.0 integration includes PowerChain PET-20 Energy RWA metadata, deterministic serialization, tenant/company authorization, Solscan/Suiscan links, Pyth/Birdeye/CoinMarketCap adapters, fixed-point currency-rate processing, reward epochs, rate limiting, idempotent safe actions, and expanded SaaS API-key/usage controls.



## Workspace repair

If the Local Energy OS files were copied into an existing PowerChain monorepo
but the root scripts are missing, run:

```bash
node scripts/local-energy-os/repair-workspace.mjs .
```

Then:

```bash
pnpm local-energy:doctor
pnpm local-energy:verify
pnpm local-energy:build
pnpm local-energy:typecheck
pnpm typecheck
```

The Local Energy OS build/typecheck commands intentionally filter only the
Local Energy OS packages. The full `pnpm typecheck` remains the repository-wide
validation gate.
