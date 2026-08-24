import { z } from "zod";

const optionalUrl = z.union([z.string().url(), z.literal("")]).optional();
const optionalSecret = z.string().trim().min(1).optional().or(z.literal(""));

export const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalSecret,
  NEXT_PUBLIC_AI_ENABLED: z.enum(["true", "false"]).default("true"),
  NEXT_PUBLIC_SOLANA_CLUSTER: z
    .enum(["devnet", "mainnet-beta", "custom"])
    .default("devnet"),
  NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SOLANA_CUSTOM_RPC_URL: optionalUrl,
  NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_DEVNET: z.string().trim().optional(),
  NEXT_PUBLIC_POWERCHAIN_PROGRAM_ID_MAINNET: z.string().trim().optional(),
  NEXT_PUBLIC_PWRC_MINT: z.string().trim().optional(),
  NEXT_PUBLIC_CRT_MINT: z.string().trim().optional(),
  NEXT_PUBLIC_WPWRC_SUI_TYPE: z.string().trim().optional(),
  NEXT_PUBLIC_SUI_NETWORK: z
    .enum(["devnet", "testnet", "mainnet", "custom"])
    .default("testnet"),
  NEXT_PUBLIC_SUI_DEVNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_TESTNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_MAINNET_RPC_URL: optionalUrl,
  NEXT_PUBLIC_SUI_CUSTOM_RPC_URL: optionalUrl,
});

export const serverEnvironmentSchema = clientEnvironmentSchema.extend({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  AI_PROVIDER: z
    .enum(["mock", "openai", "azure", "anthropic", "google", "custom"])
    .default("mock"),
  AI_API_KEY: optionalSecret,
  AI_BASE_URL: optionalUrl,
  SOLANA_DEVNET_RPC_URL: optionalUrl,
  SOLANA_MAINNET_RPC_URL: optionalUrl,
  SOLANA_CUSTOM_RPC_URL: optionalUrl,
  HELIUS_API_KEY: optionalSecret,
  HELIUS_RPC_URL: optionalUrl,
  HELIUS_DEVNET_RPC_URL: optionalUrl,
  HELIUS_MAINNET_RPC_URL: optionalUrl,
  PYTH_HERMES_URL: optionalUrl,
  PYTH_PRICE_FEED_ID: z.string().trim().optional(),
  BIRDEYE_API_KEY: optionalSecret,
  BIRDEYE_BASE_URL: optionalUrl,
  COINMARKETCAP_API_KEY: optionalSecret,
  COINMARKETCAP_BASE_URL: optionalUrl,
  FX_RATES_BASE_URL: optionalUrl,
  SOLSCAN_BASE_URL: optionalUrl,
  SUISCAN_BASE_URL: optionalUrl,
  DIGITAL_ENERGY_ALLOW_DEMO_FALLBACK: z.enum(["true", "false"]).default("false"),
  POWERCHAIN_REWARD_EPOCH_ID: z.string().trim().optional(),
  POWERCHAIN_REWARD_EPOCH_START: z.string().datetime().optional().or(z.literal("")),
  POWERCHAIN_REWARD_EPOCH_END: z.string().datetime().optional().or(z.literal("")),
  SUI_DEVNET_RPC_URL: optionalUrl,
  SUI_TESTNET_RPC_URL: optionalUrl,
  SUI_MAINNET_RPC_URL: optionalUrl,
  SUI_CUSTOM_RPC_URL: optionalUrl,
  MAP_PROVIDER: z.enum(["internal", "mapbox", "google"]).default("internal"),
  MAPBOX_ACCESS_TOKEN: optionalSecret,
  GOOGLE_MAPS_API_KEY: optionalSecret,
  MAIL_API_URL: optionalUrl,
  MAIL_API_KEY: optionalSecret,
  MAIL_FROM: z.string().email().optional(),
  CETUS_NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),
  CETUS_FULLNODE_URL: optionalUrl,
  CIRCLE_API_KEY: optionalSecret,
  CIRCLE_BASE_URL: optionalUrl,
  STRIPE_SECRET_KEY: optionalSecret,
  STRIPE_WEBHOOK_SECRET: optionalSecret,
  STRIPE_BASE_URL: optionalUrl,
  MOONPAY_API_KEY: optionalSecret,
  MOONPAY_SECRET_KEY: optionalSecret,
  MOONPAY_BASE_URL: optionalUrl,
  COINBASE_PAY_API_KEY: optionalSecret,
  COINBASE_PAY_BASE_URL: optionalUrl,
  JUPITER_BASE_URL: optionalUrl,
  RAYDIUM_BASE_URL: optionalUrl,
  METEORA_BASE_URL: optionalUrl,
  ORCA_BASE_URL: optionalUrl,
  METAPLEX_BASE_URL: optionalUrl,
  HELIUM_API_URL: optionalUrl,
  INTEGRATION_GATEWAY_TOKEN: optionalSecret,
  CORS_ALLOWED_ORIGINS: z.string().trim().optional(),
  DATABASE_URL: z.string().trim().optional(),
  DIRECT_URL: z.string().trim().optional(),
  SUPABASE_SECRET_KEY: optionalSecret,
  SENTRY_DSN: optionalUrl,
});

export type ClientEnvironment = z.infer<typeof clientEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
