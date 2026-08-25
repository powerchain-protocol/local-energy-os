# PowerChain On-Chain Programs

PowerChain on-chain code represents verified digital state and settlement constraints. It does **not** replace smart meters, SCADA, physical plausibility checks, PostgreSQL accounting, or regulatory registries.

## Current program surface

```text
programs/energy-rwa/    Anchor / Solana Energy Batch + Energy Position program
move/powerchain/        Sui Move representation layer
```

## Authority boundary

The Energy RWA program separates an administrator from a verification authority. The verification authority can create/finalize Energy Batches backed by evidence produced off-chain. Issuance is permitted only after finalization and cannot exceed `verified_wh - invalidated_wh`.

## Canonical units

On-chain energy quantities are integer Wh. `KWH` positions must align to 1,000 Wh and `MWH` positions to 1,000,000 Wh.

## Indexer contract

Program events are intended for the PowerChain indexer/outbox reconciliation path. Event observation does not itself make an off-chain settlement final; the canonical service reconciles program state back into the Energy Ledger.

## Deployment gates

Before deployment: replace placeholder program IDs, use secure deployment identities, run Anchor/Solana and Sui tests, review authorities/PDA seeds, audit arithmetic and account constraints, pin network configuration, and verify indexer compatibility.
