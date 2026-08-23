# PowerChain Local Energy OS v1.0.0

PowerChain coordinates physical energy, verified evidence, local markets, settlement, energy RWA representations, PWRC rewards, and multi-chain interoperability while keeping each accounting domain separate.

## Canonical flow

```text
Physical Energy
→ Metering / Telemetry
→ Verification
→ Energy Proof
→ Energy Batch
→ Energy Position / RWA (optional)
→ Local Market / Grid / Flexibility
→ Physical Delivery
→ Reconciliation
→ Financial Settlement
→ Solana / Sui / Cross-Chain
→ Receipts / Provenance / PWRC Rewards
```

## Asset model

| Asset / quantity | Canonical network / ledger | Meaning |
|---|---|---|
| Wh | PowerChain Energy Ledger | canonical physical-energy accounting |
| kWh / MWh | display / optional RWA representation | denominations backed by verified Wh |
| PWRC | Solana | native PowerChain utility/reward asset |
| wPWRC | Sui | 1:1 bridged PWRC representation |
| EURC / USDC | financial settlement | payment assets |

`PWRC != Wh != kWh != MWh`.
