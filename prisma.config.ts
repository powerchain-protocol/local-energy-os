import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL is preferred for CLI/migrations when a pooled runtime URL is used.
    // Empty fallback keeps `prisma generate` usable in type-only CI environments.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
