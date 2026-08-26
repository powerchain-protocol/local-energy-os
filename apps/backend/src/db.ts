import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";
import type { BackendConfig } from "./config.js";

let client: PrismaClient | undefined;

function operationsUrl(config: BackendConfig): string {
  const raw = config.OPERATIONS_DATABASE_URL ?? config.DATABASE_URL;
  if (raw) {
    const url = new URL(raw);
    url.searchParams.set("schema", "operations");
    return url.toString();
  }
  if (config.NODE_ENV === "production") throw new Error("OPERATIONS_DATABASE_URL_REQUIRED");
  return "postgresql://postgres:postgres@127.0.0.1:5432/powerchain?schema=operations";
}

export function getOperationsPrisma(config: BackendConfig): PrismaClient {
  if (!client) client = new PrismaClient({ adapter: new PrismaPg({ connectionString: operationsUrl(config) }) });
  return client;
}

export async function disconnectOperationsPrisma(): Promise<void> {
  const current = client;
  client = undefined;
  if (current) await current.$disconnect();
}
