# PowerChain Programs

PowerChain programs provide the deterministic on-chain trust layer for renewable-energy verification, tokenization, exchange, settlement, treasury, and governance. Application services may evolve independently, but program invariants must remain stable, auditable, and backward-compatible.

## Canonical program domains

| Domain | Responsibility |
|---|---|
| Meter Registry | Registers trusted meters, authorities, calibration metadata, and monotonic reading sequences. |
| Oracle Registry | Maintains validator identities, quorum policy, slashing state, and attestation authority. |
| Proof of Energy | Anchors verified renewable-energy measurements and prevents replay or duplicate issuance. |
| Energy Token | Mints, burns, transfers, and retires verified kWh/MWh representations. |
| Marketplace | Records orders, matches, delivery commitments, and market references. |
| Escrow | Holds settlement assets until delivery and verification requirements are satisfied. |
| Treasury | Applies fees, revenue distribution, grants, and protocol-controlled disbursements. |
| Governance | Manages proposals, voting, quorum, execution delay, and administrative authorities. |
| PWRC Bridge | Enforces lock-and-mint and burn-and-release accounting for Solana PWRC interoperability. |

## Shared program architecture

```text
programs/src/
├── config.rs
├── errors.rs
├── events.rs
├── invariants.rs
├── metering.rs
├── proof_of_energy.rs
├── tokens.rs
├── exchange.rs
├── treasury.rs
├── governance.rs
├── digital_twin.rs
├── depin.rs
├── smart_grid.rs
└── gridllm.rs
```

Shared errors, events, and invariants prevent domain modules from redefining critical behavior. Programs use checked integer arithmetic and base units; floating-point arithmetic is not permitted for balances, energy quantities, fees, or token supply.

## Critical invariants

1. One verified unit of renewable electricity can be issued, transferred, settled, and retired exactly once.
2. Every energy token must trace to a registered asset, trusted meter reading, and accepted oracle attestation.
3. Mintable energy equals verified energy minus losses, prior issuance, rejected quantities, and disputed quantities.
4. Solana circulating PWRC must never exceed native PWRC locked or escrowed for the Solana integration.
5. Settlement mutations must be idempotent and use deterministic operation references.
6. Administrative and treasury mutations require explicit authorities and must emit auditable events.
7. Paused programs reject new state-changing operations while preserving reads and recovery procedures.

## Network targets

| Target | Purpose |
|---|---|
| Localnet | Deterministic development and integration testing. |
| Devnet | Public testing, wallet integration, and program validation. |
| Mainnet Beta | Production deployment after audit, authority ceremony, and deployment approval. |

Program IDs in development configuration are placeholders until deployment. Production addresses must be published with build hashes, upgrade authorities, IDLs, deployment slot, and audit evidence.

## Build and validation

```bash
anchor build
cargo test --manifest-path programs/Cargo.toml
pnpm programs:check
pnpm programs:test
```

The repository program checks validate module exports, domain program folders, manifests, network targets, event definitions, and critical invariant documentation.

## Security and release gates

A mainnet release requires:

- Independent program audit
- Reproducible build evidence
- IDL and source-code publication
- Upgrade-authority and treasury-authority review
- Devnet soak testing
- Invariant and adversarial test coverage
- Migration and rollback plan
- Incident-response owner

See [`docs/programs/SECURITY.md`](docs/programs/SECURITY.md) and [`docs/programs/DEPLOYMENT.md`](docs/programs/DEPLOYMENT.md).
