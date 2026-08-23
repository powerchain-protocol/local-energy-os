# PowerChain Contributors

Thank you for contributing to **PowerChain Local Energy OS**.

This repository coordinates physical-energy evidence, markets, financial settlement, blockchain infrastructure, Energy RWA, SaaS applications, and machine-economy services. Contributions must preserve the boundaries between those domains.

## Canonical engineering principles

Every contribution must preserve these invariants:

1. **Physical energy is authoritative.**
2. **Wh is the canonical integer energy-accounting unit.**
3. **kWh and MWh are denominations / Energy RWA presentation units backed by verified Wh.**
4. **PWRC is the native PowerChain asset on Solana and is not electricity.**
5. **wPWRC is the 1:1 bridge-backed representation of PWRC on Sui.**
6. **Cross-chain Energy RWA representations cannot exceed canonical verified backing.**
7. **Blockchain payment confirmation is not physical-delivery confirmation.**
8. **Battery discharge does not create new renewable provenance.**
9. **Stale or invalid oracle data must fail safely for price-sensitive operations.**
10. **Agents cannot bypass platform policy, simulation, spend controls, or required human approval.**

## Repository areas

| Area | Responsibility |
|---|---|
| `apps/docs/` | deployable documentation and whitepaper application |
| `apps/energy/` | Energy Command Center and energy operations |
| `apps/platform/` | SaaS control plane, tenants, plans, apps, entitlements |
| `apps/grid/` | grid topology, constraints, congestion, flexibility |
| `apps/charging/` | EVSE, charging, smart charging and V2G |
| `apps/api/` | canonical `/api/v1` control plane |
| `packages/energy-core/` | Wh accounting, proofs, batches, positions and invariants |
| `packages/energy-rwa/` | Energy RWA representation registry |
| `packages/pwrc/` | PWRC / wPWRC asset contracts |
| `packages/svm/` | Solana/SVM adapter boundary |
| `packages/sui/` | Sui adapter boundary |
| `packages/cross-chain/` | cross-chain representation coordination |
| `packages/cctp/` | native USDC interoperability |
| `packages/oracles/` | provider-independent oracle routing |
| `packages/x402/` | machine-payment policy and execution contracts |
| `programs/` | Solana programs |
| `move/` | Sui Move packages |
| `supabase/` | executable database migrations |
| `docs/` | canonical source documentation |

## Development environment

Canonical development requirements:

```bash
corepack enable
corepack use pnpm@11.22.0
pnpm install --no-frozen-lockfile
```

The repository targets:

```text
Node.js >=24 <25
pnpm 11.22.0
TypeScript 5.9.x
```

Before submitting a change, run the checks available in the target workspace:

```bash
pnpm local-energy:doctor
pnpm local-energy:verify
pnpm local-energy:build
pnpm typecheck
```

When the full monorepo provides additional checks, run those as well.

## Contribution workflow

1. Keep each change focused on one coherent capability or fix.
2. Preserve existing application routes, package boundaries, and data flows unless the change explicitly requires a migration.
3. Update domain types and invariants before wiring UI behavior that depends on them.
4. Add or update database migrations for persistent schema changes.
5. Add request validation at API boundaries.
6. Keep blockchain-specific logic behind `svm`, `sui`, bridge, or cross-chain adapters.
7. Update the canonical documentation when behavior or architecture changes.
8. Add validation for any new safety invariant.
9. Never commit secrets, private keys, RPC credentials, wallet seed phrases, production tokens, or unredacted customer data.

## Energy-domain changes

Energy changes should use integer Wh internally.

Preferred:

```ts
const deliveredWh = 7_862n;
```

Avoid floating-point authoritative accounting:

```ts
const deliveredKwh = 7.862; // display only, not canonical ledger state
```

Any function that issues, reserves, migrates, or retires Energy RWA must prove that active supply remains within verified backing.

## Blockchain changes

Blockchain code must preserve the separation between:

```text
Physical Energy
Energy RWA
Financial Assets
PWRC / wPWRC
```

For Solana:

- simulate before execution where applicable
- preserve idempotency and confirmation state
- avoid single-provider RPC assumptions
- keep PWRC native to Solana

For Sui:

- keep wPWRC bridge-backed
- preserve canonical Energy RWA allocation
- do not independently mint physical-energy supply

## Documentation changes

`docs/` is the canonical documentation source.

`apps/docs/` renders those documents as the deployable documentation experience.

When changing architecture, update both the implementation and its corresponding canonical document. Do not maintain contradictory copies of protocol rules.

## Security

Treat the following as security-sensitive:

- energy-proof validation
- Energy RWA issuance
- retirement
- treasury and settlement
- PWRC / wPWRC bridge accounting
- cross-chain representations
- oracle freshness
- agent spend policy
- production write-mode configuration

Security-relevant changes should include explicit failure behavior and should fail closed where the system would otherwise create unbacked supply, duplicate settlement, or unauthorized execution.

## Contributor acknowledgement

Contributor names should be added through reviewed repository changes rather than invented or inferred. Project history and version-control authorship remain the authoritative attribution source.
