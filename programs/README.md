# PowerChain Programs

**Canonical version:** 1.0.0  
**Primary execution network:** Solana / SVM  
**Secondary representation network:** Sui / Move

PowerChain programs enforce digital-state invariants around verified energy and settlement. Physical electricity remains authoritative off-chain.

## Repository layout

```text
programs/
└── energy-rwa/
    ├── Anchor.toml
    ├── Cargo.toml
    ├── README.md
    └── src/lib.rs

move/powerchain/
└── sources/energy_position.move
```

## Energy RWA program

Current Anchor instructions:

```text
initialize_config
set_paused
set_verification_authority
create_batch
finalize_batch
invalidate_batch_energy
create_position
reserve
release
retire
```

### Canonical invariants

- `PWRC` is native Token-2022 state on Solana and is not an energy unit.
- `wPWRC` is the 1:1 bridged Sui representation of PWRC.
- Energy positions are backed by verification-authority-attested Energy Batches.
- `positioned_wh <= verified_wh - invalidated_wh`.
- `retired_wh <= positioned_wh`.
- kWh/MWh positions must align exactly to canonical Wh.
- Every arithmetic path that changes supply/reservation/retirement uses checked operations.
- Program pause is an emergency control, not a substitute for transaction authorization.

## Evidence boundary

Raw meter telemetry is not stored on Solana. The off-chain verification pipeline produces an `evidence_root`; the finalized Energy Batch commits the verified quantity and root on-chain.

## Deployment safety

The checked-in `declare_id!("11111111111111111111111111111111")` is intentionally invalid for production deployment. Generate deployment identities in a secure environment, replace the ID in Rust and `Anchor.toml`, and never commit keypairs.

## Validation

```bash
anchor build
anchor test
```

The release workflow also requires Prisma/API/TypeScript application checks because program state is reconciled with the canonical Energy Ledger. See `docs/PROGRAMS.md`.
