# Cross-Chain Architecture

Energy RWA supply is canonical in the PowerChain Energy Ledger. Chain representations are allocations, not new physical supply.

```text
Canonical Energy Position
          ↓
Representation Allocation
       ┌──┴──┐
       ▼     ▼
    Solana  Sui
```

Invariant: `Solana active Wh + Sui active Wh <= canonical Energy Position backing`.

PWRC bridging and Energy RWA representation are separate mechanisms. CCTP stablecoin movement is also separate from Energy RWA supply.
