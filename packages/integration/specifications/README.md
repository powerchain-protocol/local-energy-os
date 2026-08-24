# PowerChain Integration Layer

The integration layer connects operational technology and decentralized infrastructure to PowerChain through explicit, provider-isolated adapters.

## Supported boundaries

- SAP enterprise workflows
- SCADA, OPC UA, and MQTT telemetry
- Helium hotspot discovery
- LoRaWAN uplink normalization
- Solana settlement and Blinks
- Sui account data

Production adapters must use server-side credentials, bounded timeouts, schema validation, idempotency keys, structured logs, and circuit-breaker behavior. Provider failures must degrade to explicit unavailable states rather than fabricated live data.
