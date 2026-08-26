import { z } from "zod";

const blankToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalString = z.preprocess(blankToUndefined, z.string().optional());
const optionalUrl = z.preprocess(blankToUndefined, z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  POWERCHAIN_ENVIRONMENT: z.enum(["development", "staging", "production"]).optional(),
  BACKEND_HOST: z.string().default("127.0.0.1"),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://localhost:3000"),
  DATABASE_URL: optionalString,
  OPERATIONS_DATABASE_URL: optionalString,
  OPERATIONS_DIRECT_URL: optionalString,
  OPERATIONS_INTERNAL_BEARER_TOKEN: optionalString,
  OPERATIONS_FRESHNESS_MS: z.coerce.number().int().min(1_000).max(3_600_000).default(15_000),
  POWERCHAIN_TRUST_DEV_HEADERS: z.enum(["true", "false"]).default("false"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_PUBLISHABLE_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_REALTIME_ENABLED: z.enum(["true", "false"]).default("false"),
  SUPABASE_REALTIME_CHANNEL: z.string().min(1).default("powerchain-operations"),
  REDIS_URL: optionalString,
  SOLANA_CLUSTER: z.enum(["devnet", "mainnet-beta"]).default("devnet"),
  SOLANA_RPC_URL: optionalUrl,
  SUI_NETWORK: z.enum(["localnet", "devnet", "testnet", "mainnet"]).default("devnet"),
  SUI_RPC_URL: optionalUrl,
  MARKET_DATA_PROVIDER: z.string().default("unconfigured"),
  MARKET_DATA_BASE_URL: optionalUrl,
  MARKET_DATA_API_KEY: optionalString,
});

export type BackendConfig = z.infer<typeof schema>;
export function loadBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig { return schema.parse(env); }
export function publicBackendConfig(c: BackendConfig) {
  return {
    environment: c.POWERCHAIN_ENVIRONMENT ?? c.NODE_ENV,
    api: { host: c.BACKEND_HOST, port: c.BACKEND_PORT, version: "v1" },
    database: { configured: Boolean(c.OPERATIONS_DATABASE_URL || c.DATABASE_URL) || c.NODE_ENV !== "production", schema: "operations" },
    auth: { internalBearerConfigured: Boolean(c.OPERATIONS_INTERNAL_BEARER_TOKEN), developmentHeaders: c.NODE_ENV !== "production" && c.POWERCHAIN_TRUST_DEV_HEADERS === "true" },
    supabase: { configured: Boolean(c.SUPABASE_URL && c.SUPABASE_PUBLISHABLE_KEY), realtimeEnabled: c.SUPABASE_REALTIME_ENABLED === "true" },
    redis: { configured: Boolean(c.REDIS_URL) },
    solana: { cluster: c.SOLANA_CLUSTER, rpcConfigured: Boolean(c.SOLANA_RPC_URL), mode: "read-only" },
    sui: { network: c.SUI_NETWORK, rpcConfigured: Boolean(c.SUI_RPC_URL), mode: "read-only" },
    marketData: { provider: c.MARKET_DATA_PROVIDER, configured: Boolean(c.MARKET_DATA_BASE_URL) },
    safeActions: { executionEndpointsAvailable: false },
  };
}
