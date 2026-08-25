import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

const root = path.dirname(fileURLToPath(import.meta.url));

// Shell/CI values keep precedence. Project-local files are resolved from the
// repository root, not the caller's current working directory.
for (const file of [".env.local", ".env"]) {
  loadEnv({ path: path.join(root, file), override: false, quiet: true });
}

const LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/powerchain?schema=public";

const environment =
  (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();

const directUrl = process.env.DIRECT_URL?.trim();
const runtimeUrl = process.env.DATABASE_URL?.trim();
const datasourceUrl = directUrl || runtimeUrl || (environment === "production" ? "" : LOCAL_DATABASE_URL);

if (!datasourceUrl) {
  throw new Error(
    "PowerChain Prisma datasource is empty. Set DIRECT_URL (preferred for migrations) or DATABASE_URL. Run `pnpm env:setup` and `pnpm prisma:doctor`.",
  );
}

export default defineConfig({
  schema: path.join(root, "prisma/schema.prisma"),
  migrations: {
    path: path.join(root, "prisma/migrations"),
  },
  datasource: {
    url: datasourceUrl,
    ...(process.env.SHADOW_DATABASE_URL?.trim()
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL.trim() }
      : {}),
  },
});
