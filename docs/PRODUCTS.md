# PowerChain Products

Version **1.0.0**

PowerChain products share the same Digital Energy authority model and operator platform.

## Product portfolio

### Digital Energy OS

The canonical energy-infrastructure operating system.

```text
Physical infrastructure
→ telemetry
→ Digital Twin
→ verified energy
→ Energy Position
→ delivery
→ settlement
```

### PowerChain Copilot

The unified Renewable RWA AI operator interface.

Architecture workspace:

```text
/copilot/architecture
```

Canonical visual:

```text
/public/images/architectures/powerchain-copilot-architecture.png
```

```text
Copilot
→ RWA Orchestrator
→ Agents
→ Skills
→ Action Center
→ Human approval
```

### Energy RWA

PET-20 `VERIFIED_ENERGY_POSITION` assets backed by `POWERCHAIN_ENERGY_LEDGER`.

### Local Energy OS

Canonical route:

```text
/local-energy
```

A grid-aware local energy coordination system covering communities, smart meters, prosumers, P2P markets, flexibility, storage, EV charging, delivery and settlement.

```text
Local Energy OS
├── Community
├── Local Market
├── Grid & Flexibility
├── Devices & Edge
└── Delivery & Settlement
```

Physical delivery and financial settlement remain separate.

### PowerChain Infrastructure

Solana/SVM, Sui/Move, oracle, RPC, explorer, bridge and machine-payment infrastructure.

### Energy Devices

Smart metering, EVSE, renewable controls and trusted edge devices.

## Canonical product relationships

```text
DIGITAL ENERGY OS
      │
      ├── Energy RWA
      ├── Local Energy OS
      ├── Infrastructure
      └── Energy Devices
      │
      ▼
POWERCHAIN COPILOT
Unified operator intelligence across products
```

Copilot does not replace product authority. It reads, analyzes and coordinates each product through explicit tool/permission boundaries.
