import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function encode(value: string): string {
  return encodeURIComponent(value);
}

function developmentDatabaseUrl(): string {
  const host = process.env.PGHOST?.trim() || "127.0.0.1";
  const port = process.env.PGPORT?.trim() || "5432";
  const user = process.env.PGUSER?.trim() || "postgres";
  const password = process.env.PGPASSWORD ?? "postgres";
  const database = process.env.PGDATABASE?.trim() || "powerchain";
  const schema = process.env.PGSCHEMA?.trim() || "public";
  return `postgresql://${encode(user)}:${encode(password)}@${host}:${port}/${encode(database)}?schema=${encode(schema)}`;
}

export function resolveRuntimeDatabaseUrl(): string | undefined {
  const configured = process.env.DATABASE_URL?.trim();
  if (configured) return configured;
  const environment = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();
  return environment === "production" ? undefined : developmentDatabaseUrl();
}

function createPrismaClient(): PrismaClient {
  const connectionString = resolveRuntimeDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required before the PowerChain database client can execute queries in production.",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/** Returns the process-wide Prisma client. Construction is lazy. */
export function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prismaClient) globalForPrisma.prismaClient = createPrismaClient();
  return globalForPrisma.prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export type { PrismaClient } from "./generated/prisma/client";
