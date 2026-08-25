import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 reads datasource configuration from this file. Load local overrides
// first, then the shared root .env without replacing variables already exported
// by the shell/CI environment.
loadEnv({ path: ".env.local", override: false, quiet: true });
loadEnv({ path: ".env", override: false, quiet: true });

const LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/powerchain?schema=public";

const environment =
  process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";

const configuredUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

// Local development has a deterministic Docker/Postgres default. Production
// never falls back to localhost: an explicit URL is mandatory there.
const datasourceUrl =
  configuredUrl || (environment === "production" ? "" : LOCAL_DATABASE_URL);

if (!datasourceUrl) {
  throw new Error(
    "PowerChain Prisma datasource is not configured. Set DIRECT_URL (preferred for migrations) or DATABASE_URL. See .env.example and docs/DATABASE.md.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
