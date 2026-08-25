# PowerChain Programs

PowerChain blockchain programs represent and settle verified digital state; they do not verify physical electricity directly.

## Canonical boundaries

- **PWRC** is native Token-2022 state on Solana.
- **wPWRC** is the 1:1 Sui bridge representation.
- **Energy RWA** programs may represent verified kWh/MWh positions, but issuance remains bounded by an attested Energy Batch backed by the off-chain Energy Ledger.

## `energy-rwa/`

The Anchor program now implements:

```text
initialize_config
create_batch
finalize_batch
create_position
reserve
release
retire
set_paused
set_verification_authority
```

Critical invariants include verification-authority ownership, finalized-batch issuance, checked arithmetic, kWh/MWh Wh alignment, anti-overissuance, batch/position consistency, and retirement not exceeding issued energy.

The checked-in program ID is a scaffold placeholder and must be replaced with the deployment program ID before any deployment. Never commit deployment keypairs.
