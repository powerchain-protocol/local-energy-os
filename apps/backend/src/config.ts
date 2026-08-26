import { z } from "zod";

const blankToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalString = z.preprocess(blankToUndefined, z.string().optional());
const optionalUrl = z.preprocess(blankToUndefined, z.string().url().optional());
const optionalSecret = (min = 1) => z.preprocess(blankToUndefined, z.string().min(min).optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_HOST: z.string().default("127.0.0.1"),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  CORS_ORIGINS: z.string().default("http://127.0.0.1:3000,http://localhost:3000"),
  DATABASE_URL: optionalString,
  OPERATIONS_DATABASE_URL: optionalString,
  OPERATIONS_INTERNAL_BEARER_TOKEN: optionalSecret(24),
  POWERCHAIN_TRUST_DEV_HEADERS: z.enum(["true", "false"]).default("false"),
  OPERATIONS_FRESHNESS_MS: z.coerce.number().int().min(1000).default(15000),
  SUPABASE_URL: optionalUrl,
  SUPABASE_PUBLISHABLE_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret(),
  SUPABASE_REALTIME_ENABLED: z.enum(["true", "false"]).default("false"),
  SUPABASE_REALTIME_CHANNEL: z.string().default("powerchain-operations"),
  REDIS_URL: optionalString,
  SOLANA_CLUSTER: z.enum(["devnet", "mainnet-beta"]).default("devnet"),
  SOLANA_RPC_URL: optionalUrl,
  SUI_NETWORK: z.enum(["localnet", "devnet", "testnet", "mainnet"]).default("devnet"),
  SUI_RPC_URL: optionalUrl,
  MARKET_DATA_PROVIDER: z.string().default("unconfigured"),
  MARKET_DATA_BASE_URL: optionalUrl,
  MARKET_DATA_API_KEY: optionalSecret(),
});

export type BackendConfig = z.infer<typeof schema>;
export function loadBackendConfig(env: NodeJS.ProcessEnv = process.env): BackendConfig { return schema.parse(env); }
export function publicBackendConfig(c: BackendConfig) {
  return {
    environment: c.NODE_ENV,
    api: { host: c.BACKEND_HOST, port: c.BACKEND_PORT, version: "v1" },
    operationsDatabase: { configured: Boolean(c.OPERATIONS_DATABASE_URL || c.DATABASE_URL) || c.NODE_ENV !== "production", schema: "operations" },
    auth: { internalBearerConfigured: Boolean(c.OPERATIONS_INTERNAL_BEARER_TOKEN), supabaseConfigured: Boolean(c.SUPABASE_URL && c.SUPABASE_PUBLISHABLE_KEY) },
    supabase: { configured: Boolean(c.SUPABASE_URL && c.SUPABASE_PUBLISHABLE_KEY), realtimeEnabled: c.SUPABASE_REALTIME_ENABLED === "true" },
    redis: { configured: Boolean(c.REDIS_URL) },
    solana: { cluster: c.SOLANA_CLUSTER, rpcConfigured: Boolean(c.SOLANA_RPC_URL), mode: "read-only" },
    sui: { network: c.SUI_NETWORK, rpcConfigured: Boolean(c.SUI_RPC_URL), mode: "read-only" },
    marketData: { provider: c.MARKET_DATA_PROVIDER, configured: Boolean(c.MARKET_DATA_BASE_URL) },
    actionPreparation: { physicalDispatchExecution: false, settlementExecution: false },
  };
}
