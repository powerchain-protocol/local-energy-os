# PowerChain Energy RWA Program

**Network:** Solana / SVM  
**Framework:** Anchor  
**Canonical version:** 1.0.0

The program represents Energy Positions backed by verification-authority-attested Energy Batches. Physical meter evidence remains off-chain; the on-chain batch stores the verified Wh supply and evidence commitment.

## Accounts

```text
PowerChainConfig
  admin
  verification_authority
  paused

EnergyBatch
  batch_id
  verification_authority
  verified_wh
  invalidated_wh
  positioned_wh
  retired_wh
  source
  evidence_root
  finalized

EnergyPosition
  batch
  owner
  position_nonce
  amount_wh
  reserved_wh
  retired_wh
  unit
```

## Lifecycle

```text
Verification Authority
  ↓ create_batch
EnergyBatch
  ↓ finalize_batch
FINALIZED
  ↓ create_position
EnergyPosition
  ├─ reserve
  ├─ release
  └─ retire
```

`position_nonce` is part of the PDA seed so an owner can create multiple positions against the same batch without PDA collisions.

## Energy units

The program stores integer Wh and validates denomination alignment:

```text
KWH → amount_wh % 1,000 == 0
MWH → amount_wh % 1,000,000 == 0
```

## Supply invariant

```text
positioned_wh <= verified_wh - invalidated_wh
retired_wh <= positioned_wh
```

All arithmetic that increases supply/reservations/retirement uses checked operations.

## Deployment

`declare_id!("11111111111111111111111111111111")` is intentionally a scaffold placeholder. Generate the deployment keypair in the secure deployment environment, update the program ID and `Anchor.toml`, build, test and audit before deployment.
