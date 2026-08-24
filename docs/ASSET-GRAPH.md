# PowerChain Asset Graph

The Asset Graph gives Digital Energy OS a canonical relationship model without creating a second accounting ledger.

```text
SITE
  └── PRODUCES ─────────► ENERGY_BATCH
                              │
GRID_AREA ◄── LOCATED_IN ─────┤
                              │
                              └── BACKS ──► ENERGY_POSITION
                                                │
                                                └── REPRESENTED_BY
                                                     ├── SOLANA
                                                     └── SUI
```

The graph is generated from authoritative Energy Ledger state and is organization scoped.

It supports:

- provenance navigation;
- AI reasoning context;
- due diligence;
- reporting;
- infrastructure/energy relationship traversal;
- multi-network representation visibility.

It does **not** independently determine energy balances. `@powerchain/energy-core` and the persisted Energy Ledger remain canonical for quantities.

API:

```text
GET /api/v1/digital-energy/asset-graph
GET /api/v1/asset-graph
```
