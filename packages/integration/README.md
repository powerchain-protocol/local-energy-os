# @powerchain/integration

Typed reliability boundary for PowerChain external systems.

## Scope

- Core result, error, health, retry, circuit-breaker, idempotency and telemetry contracts
- SAP business operations
- SCADA and OPC UA protected ingestion boundaries
- MQTT and LoRaWAN telemetry normalization
- Helium network discovery
- Solana and Sui transaction boundaries

## Rule

No valid provider response means no live data. Production adapters return explicit unavailable, degraded or misconfigured results and never silently substitute fixture data.
