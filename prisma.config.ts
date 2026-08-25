import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local", override: false, quiet: true });
loadEnv({ path: ".env", override: false, quiet: true });

const environment = process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
const encode = (value: string) => encodeURIComponent(value);

function pgVarsUrl(): string {
  if (environment === "production" && !process.env.PGHOST) return "";
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const user = process.env.PGUSER?.trim() || "postgres";
  const password = process.env.PGPASSWORD ?? "postgres";
  const database = process.env.PGDATABASE?.trim() || "powerchain";
  const schema = process.env.PGSCHEMA?.trim() || "public";
  return `postgresql://${encode(user)}:${encode(password)}@${host}:${port}/${encode(database)}?schema=${encode(schema)}`;
}

const datasourceUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim() || pgVarsUrl();
if (!datasourceUrl) {
  throw new Error("PowerChain Prisma datasource is not configured. Set DIRECT_URL/DATABASE_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: datasourceUrl,
    ...(process.env.SHADOW_DATABASE_URL?.trim() ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL.trim() } : {}),
  },
});
