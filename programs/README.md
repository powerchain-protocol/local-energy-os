# PowerChain Programs

PowerChain on-chain programs provide **settlement, representation and programmable coordination** around the canonical Energy Ledger. They do not create physical energy authority.

## Current program set

```text
programs/
└── energy-rwa/
    ├── Anchor.toml
    ├── Cargo.toml
    └── src/lib.rs
```

## Program policy

All PowerChain programs must preserve these invariants:

1. Energy positions cannot exceed verified physical Wh backing.
2. Retirement cannot exceed the issued position quantity.
3. Reservation cannot exceed available, unretired energy.
4. PWRC is the native PowerChain asset on Solana and is distinct from Energy RWA.
5. Cross-chain representations must preserve canonical supply.
6. Administrative authorities, program IDs and upgrade authorities must be explicitly configured for each environment.

## Toolchain

The current Energy RWA implementation uses Anchor. Compute-sensitive production paths may be migrated to or complemented by Pinocchio only after tests preserve the same account/state invariants.

Typical validation workflow:

```bash
anchor --version
anchor build
anchor test
```

The repository-level `pnpm local-energy:verify` validates TypeScript/API/Prisma structure but does not replace Anchor program tests.

## Deployment

Never deploy with the placeholder program ID. Generate/configure the deployment keypair in your secure deployment environment and synchronize IDs with Anchor tooling before deployment. Private key material must never be committed to this repository.
