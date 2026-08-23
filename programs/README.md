# PowerChain Programs

Canonical split:

```text
programs/
├── anchor/
│   ├── registry/
│   ├── energy-market/
│   ├── charging-settlement/
│   └── treasury/
└── pinocchio/
    ├── energy-proof/
    ├── energy-batch/
    ├── energy-settlement/
    ├── pwrc-rewards/
    └── x402-settlement/
```

Anchor is preferred for complex business state machines; Pinocchio is preferred for compute-sensitive, high-volume instructions. Program implementation must preserve the physical-supply and cross-chain representation invariants enforced by the canonical Energy Ledger.
