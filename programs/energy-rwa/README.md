# PowerChain Energy RWA Program

**Program:** `powerchain-energy-rwa`  
**Framework:** Anchor  
**Version:** `1.0.0`

The Energy RWA program implements the on-chain lifecycle for physically backed Energy Positions while retaining the off-chain PowerChain Energy Ledger as the authoritative source of verified physical energy.

## Instructions

### `create_position(amount_wh, unit)`

Creates an Energy Position backed by an Energy Batch. The instruction rejects issuance when:

```text
next positioned Wh
>
verified Wh - invalidated Wh
```

### `reserve(amount_wh)`

Locks available energy for a market/order/delivery workflow.

### `release(amount_wh)`

Releases previously reserved energy back to the available position balance.

### `retire(amount_wh)`

Marks an energy quantity as retired and prevents it from circulating again.

## Accounts

### `EnergyBatch`

```text
verified_wh
invalidated_wh
positioned_wh
```

### `EnergyPosition`

```text
batch
owner
amount_wh
reserved_wh
retired_wh
unit
bump
```

Internal quantities use integer **Wh**. `kWh` and `MWh` are denominations/metadata, not independent physical supplies.

## PDA

The current position PDA is derived from:

```text
["position", batch, owner]
```

Future multi-position-per-owner support should introduce an explicit position sequence/id seed rather than weakening supply checks.

## Security notes

- The checked arithmetic and anti-overissuance rule are mandatory.
- Deployment program IDs and upgrade authority must be production-configured.
- The checked-in `11111111111111111111111111111111` ID is a scaffold placeholder and must not be used for deployment.
- Program changes require unit/integration tests for reserve/release/retire edge cases and concurrent issuance assumptions.

## Build

```bash
cd programs/energy-rwa
anchor build
anchor test
```

See `../README.md` and `../../docs/ASSETS.md` for the broader asset model.
