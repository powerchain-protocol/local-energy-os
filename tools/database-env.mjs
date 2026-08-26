import { loadRootEnv } from "./load-root-env.mjs";

export const LOCAL_DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/powerchain?schema=public";

export function resolveDatabaseEnvironment() {
  const root = loadRootEnv();
  const environment = (process.env.POWERCHAIN_ENVIRONMENT ?? process.env.NODE_ENV ?? "development").trim();
  const directUrl = process.env.DIRECT_URL?.trim();
  const runtimeUrl = process.env.DATABASE_URL?.trim();
  const shadowUrl = process.env.SHADOW_DATABASE_URL?.trim();
  const effectiveUrl = directUrl || runtimeUrl || (environment === "production" ? "" : LOCAL_DATABASE_URL);
  return { root, environment, directUrl, runtimeUrl, shadowUrl, effectiveUrl };
}

export function parseDatabaseTarget(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["postgresql:", "postgres:"].includes(url.protocol)) return null;
    return { url, host: url.hostname, port: Number(url.port || 5432), database: url.pathname.replace(/^\//, "") || "postgres" };
  } catch {
    return null;
  }
}

export function isLocalDatabaseHost(host) {
  return ["localhost", "127.0.0.1", "::1"].includes(host);
}
