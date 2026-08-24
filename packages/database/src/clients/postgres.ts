import "server-only";
import { Pool, type PoolConfig, type QueryResultRow } from "pg";

const globalForPostgres = globalThis as unknown as { powerChainPg?: Pool };

function databaseConfig(): PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required to create the PostgreSQL pool");
  return {
    connectionString,
    max: Number(process.env.POSTGRES_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.POSTGRES_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  };
}

export function getPostgresPool() {
  globalForPostgres.powerChainPg ??= new Pool(databaseConfig());
  return globalForPostgres.powerChainPg;
}

export function queryPostgres<Row extends QueryResultRow>(text: string, values: readonly unknown[] = []) {
  return getPostgresPool().query<Row>(text, [...values]);
}

export async function closePostgresPool() {
  if (!globalForPostgres.powerChainPg) return;
  await globalForPostgres.powerChainPg.end();
  globalForPostgres.powerChainPg = undefined;
}
