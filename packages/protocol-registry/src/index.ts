export interface ProtocolCapability {
  domain: string;
  protocol: string;
  enabled: boolean;
  version?: string;
  adapter?: string;
}

export const DEFAULT_PROTOCOL_REGISTRY: readonly ProtocolCapability[] = [
  { domain: "smart-metering", protocol: "DLMS/COSEM", enabled: true },
  { domain: "industrial-telemetry", protocol: "OPC UA", enabled: true },
  { domain: "device-telemetry", protocol: "Modbus", enabled: true },
  { domain: "iot", protocol: "MQTT", enabled: true },
  { domain: "substation", protocol: "IEC 61850", enabled: true },
  { domain: "ev-backend", protocol: "OCPP", enabled: true },
  { domain: "ev-charger", protocol: "ISO 15118", enabled: true },
  { domain: "charging-roaming", protocol: "OCPI", enabled: true },
  { domain: "demand-response", protocol: "OpenADR", enabled: true },
  { domain: "grid-model", protocol: "IEC CIM", enabled: true },
  { domain: "supply-chain", protocol: "GS1 EPCIS", enabled: true },
  { domain: "machine-payments", protocol: "x402", enabled: true },
  { domain: "stablecoin-interop", protocol: "CCTP", enabled: true },
  { domain: "svm", protocol: "Solana", enabled: true },
  { domain: "svm-rpc", protocol: "Anza/Agave", enabled: true },
  { domain: "svm-data", protocol: "Helius", enabled: true },
  { domain: "svm-programs", protocol: "Pinocchio", enabled: true },
  { domain: "solana-assets", protocol: "Metaplex", enabled: true },
  { domain: "move-network", protocol: "Sui", enabled: true },
  { domain: "oracle", protocol: "Pyth", enabled: true },
  { domain: "oracle-fallback", protocol: "Chainlink", enabled: true },
] as const;

export function capabilitiesFor(domain: string) {
  return DEFAULT_PROTOCOL_REGISTRY.filter((capability) => capability.domain === domain);
}
