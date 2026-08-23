# Operations

Runtime identity: Environment + Operating Mode + Data Mode + Write Mode + Network + Version.

Safe examples:

- `MAINNET · LIVE · LIVE DATA · WRITES ENABLED`
- `DEVNET · SIMULATION · MOCK DATA · SIMULATED WRITES`

Forbidden: `MAINNET + MOCK DATA + WRITES ENABLED`.

Subsystem states: `OPERATIONAL`, `DEGRADED`, `DELAYED`, `UNAVAILABLE`, `MAINTENANCE`.

Monitored services include API, database, Supabase, telemetry, market matcher, settlement, Solana RPC, Sui RPC, indexer, Oracle Router, SAP, x402, CCTP, workers, notifications, and rewards.

Degraded policies preserve pending settlement on Solana outage, pause bridge completion on Sui outage, stop price-sensitive operations when oracles fail, queue SAP synchronization, mark stale telemetry and block settlement when policy requires, and allow energy operations to continue if optional PWRC rewards are unavailable.
