# PowerChain Energy RWA Program

**Version:** 1.0.0  
**Network:** Solana / SVM  
**Framework:** Anchor  
**Accounting base unit:** integer Wh

The Energy RWA program represents verified Energy Batches and owner Energy Positions. It is a digital representation/constraint layer: smart meters, SCADA, plausibility checks and the canonical Energy Ledger remain off-chain.

## Authority model

```text
Admin
  ├── pause/unpause program
  └── rotate verification authority

Verification Authority
  ├── create Energy Batch
  ├── finalize Energy Batch
  └── invalidate verified energy when backing remains sufficient

Position Owner
  ├── create Energy Position
  ├── reserve
  ├── release
  └── retire
```

## Accounts

### `PowerChainConfig`

```text
admin
verification_authority
paused
bump
```

### `EnergyBatch`

```text
batch_id
verification_authority
verified_wh
invalidated_wh
positioned_wh
retired_wh
source
evidence_root
finalized
bump
```

### `EnergyPosition`

```text
batch
owner
position_nonce
amount_wh
reserved_wh
retired_wh
unit
bump
```

## PDA seeds

```text
config   = ["config"]
batch    = ["batch", batch_id]
position = ["position", batch, owner, position_nonce_le]
```

`position_nonce` allows the same owner to maintain multiple positions against one batch without PDA collisions.

## Instructions

| Instruction | Authority | Purpose |
| --- | --- | --- |
| `initialize_config` | Admin | Establish admin and verification authority |
| `set_paused` | Admin | Emergency mutation pause |
| `set_verification_authority` | Admin | Rotate verifier for future/pending verification |
| `create_batch` | Verification authority | Commit verified Wh and evidence root |
| `finalize_batch` | Verification authority | Make batch eligible for position issuance |
| `invalidate_batch_energy` | Verification authority | Reduce verified backing only when issued positions remain fully backed |
| `create_position` | Owner | Issue an owner position against finalized backing |
| `reserve` | Owner | Lock available position quantity |
| `release` | Owner | Release reserved quantity |
| `retire` | Owner | Permanently retire position quantity |

## Energy denomination alignment

```text
KWH → amount_wh % 1,000 == 0
MWH → amount_wh % 1,000,000 == 0
```

The program stores Wh. kWh/MWh are denomination constraints, not new supplies.

## Supply invariants

```text
positioned_wh <= verified_wh - invalidated_wh
retired_wh <= positioned_wh
position.retired_wh + position.reserved_wh <= position.amount_wh
```

`invalidate_batch_energy` rejects any invalidation that would undercollateralize already positioned energy. Arithmetic that increases supply, reservation or retirement is checked.

## Events

The program emits indexer-facing events for config initialization/rotation, pause changes, batch creation/finalization/invalidation, position creation, reservation/release and retirement. Events are reconciliation signals; the canonical off-chain ledger still decides application-level completion.

## Error surface

Important domain errors include:

```text
InvalidAmount
InvalidUnit
UnitAlignment
OverIssuance
InsufficientAvailable
MathOverflow
BatchNotFinalized
BatchAlreadyFinalized
InvalidationUndercollateralizesPositions
ProgramPaused
BatchMismatch
RetirementExceedsIssued
```

## Deployment

The checked-in `declare_id!("11111111111111111111111111111111")` is a deliberate scaffold blocker. Before any deployment:

1. Generate the program identity in a secure environment.
2. Update `declare_id!` and `Anchor.toml`.
3. Build and run Anchor tests.
4. Verify PDA/address derivations and event consumers.
5. Review admin/verifier custody and rotation procedures.
6. Audit arithmetic, authorization constraints and emergency pause behavior.
7. Never commit program/deployer keypairs.
