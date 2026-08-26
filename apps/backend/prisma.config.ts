import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: "../../.env.local", override: false, quiet: true });
loadEnv({ path: "../../.env", override: false, quiet: true });

function localUrl() {
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const user = encodeURIComponent(process.env.PGUSER?.trim() || "postgres");
  const password = encodeURIComponent(process.env.PGPASSWORD ?? "postgres");
  const database = encodeURIComponent(process.env.PGDATABASE?.trim() || "powerchain");
  return `postgresql://${user}:${password}@${host}:${port}/${database}?schema=operations`;
}

function operationsUrl(value?: string) {
  const candidate = value?.trim();
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    url.searchParams.set("schema", "operations");
    return url.toString();
  } catch {
    return candidate;
  }
}

const environment = process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development";
const datasourceUrl = operationsUrl(process.env.OPERATIONS_DIRECT_URL)
  ?? operationsUrl(process.env.OPERATIONS_DATABASE_URL)
  ?? operationsUrl(process.env.DIRECT_URL)
  ?? operationsUrl(process.env.DATABASE_URL)
  ?? (environment === "production" ? "" : localUrl());

if (!datasourceUrl) throw new Error("OPERATIONS_DATABASE_URL or DATABASE_URL is required for the operations backend in production.");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: datasourceUrl },
});
