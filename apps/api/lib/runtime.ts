import { loadPowerChainRootEnv } from "@powerchain/config/node-env";
loadPowerChainRootEnv();
import { assertSafeRuntime, CANONICAL_VERSION, type DataMode, type Environment, type OperatingMode, type PowerChainNetwork, type RuntimeConfig, type WriteMode } from "@powerchain/config";

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T, name: string): T {
  const resolved = (value ?? fallback) as T;
  if (!allowed.includes(resolved)) throw Object.assign(new Error(`Invalid ${name}: ${value}`), { code: "INVALID_RUNTIME_CONFIG", status: 500 });
  return resolved;
}

export function runtimeConfig(): RuntimeConfig {
  return assertSafeRuntime({
    version: process.env.POWERCHAIN_VERSION ?? CANONICAL_VERSION,
    environment: oneOf<Environment>(process.env.POWERCHAIN_ENVIRONMENT, ["development", "staging", "production"], "development", "POWERCHAIN_ENVIRONMENT"),
    operatingMode: oneOf<OperatingMode>(process.env.POWERCHAIN_OPERATING_MODE, ["LIVE", "READ_ONLY", "SIMULATION", "MAINTENANCE"], "SIMULATION", "POWERCHAIN_OPERATING_MODE"),
    dataMode: oneOf<DataMode>(process.env.POWERCHAIN_DATA_MODE, ["live", "mock", "tba"], "mock", "POWERCHAIN_DATA_MODE"),
    writeMode: oneOf<WriteMode>(process.env.POWERCHAIN_WRITE_MODE, ["enabled", "simulated", "disabled"], "simulated", "POWERCHAIN_WRITE_MODE"),
    network: oneOf<PowerChainNetwork>(process.env.POWERCHAIN_NETWORK, ["devnet", "mainnet-beta"], "devnet", "POWERCHAIN_NETWORK"),
  });
}
