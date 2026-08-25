export const POWERCHAIN_REST_VERSION = "v1" as const;
export const POWERCHAIN_REST_BASE_PATH = "/api/v1" as const;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface ApiRouteDescriptor {
  method: HttpMethod;
  path: string;
  domain: string;
  mutation?: boolean;
  idempotencyRequired?: boolean;
}

export const POWERCHAIN_API_V1_ROUTES: readonly ApiRouteDescriptor[] = [
  { method: "GET", path: "/api/v1/health", domain: "system" },
  { method: "GET", path: "/api/v1/system/health", domain: "system" },
  { method: "GET", path: "/api/v1/system/storage", domain: "system" },
  { method: "GET", path: "/api/v1/system/transports", domain: "system" },
  { method: "POST", path: "/api/v1/auth/solana/challenge", domain: "auth", mutation: true },
  { method: "POST", path: "/api/v1/auth/solana/verify", domain: "auth", mutation: true },
  { method: "GET", path: "/api/v1/auth/session", domain: "auth" },
  { method: "DELETE", path: "/api/v1/auth/session", domain: "auth", mutation: true },
  { method: "POST", path: "/api/v1/realtime/tickets", domain: "realtime", mutation: true },
  { method: "GET", path: "/api/v1/participants/summary", domain: "participants" },
  { method: "GET", path: "/api/v1/prosumers", domain: "participants" },
  { method: "GET", path: "/api/v1/consumers", domain: "participants" },
  { method: "GET", path: "/api/v1/clients", domain: "participants" },
  { method: "GET", path: "/api/v1/grid-operators", domain: "participants" },
  { method: "GET", path: "/api/v1/energy/command-center", domain: "energy" },
  { method: "GET", path: "/api/v1/energy-proofs", domain: "energy" },
  { method: "POST", path: "/api/v1/energy-proofs", domain: "energy", mutation: true, idempotencyRequired: true },
  { method: "GET", path: "/api/v1/energy-batches", domain: "energy" },
  { method: "POST", path: "/api/v1/energy-batches", domain: "energy", mutation: true, idempotencyRequired: true },
  { method: "GET", path: "/api/v1/energy-positions", domain: "energy-rwa" },
  { method: "POST", path: "/api/v1/energy-positions", domain: "energy-rwa", mutation: true, idempotencyRequired: true },
  { method: "GET", path: "/api/v1/energy-reservations", domain: "energy-rwa" },
  { method: "POST", path: "/api/v1/energy-reservations", domain: "energy-rwa", mutation: true, idempotencyRequired: true },
  { method: "GET", path: "/api/v1/energy-retirements", domain: "energy-rwa" },
  { method: "POST", path: "/api/v1/energy-retirements", domain: "energy-rwa", mutation: true, idempotencyRequired: true },
  { method: "GET", path: "/api/v1/energy-rwa/units", domain: "energy-rwa" },
  { method: "GET", path: "/api/v1/grid/areas", domain: "grid" },
  { method: "GET", path: "/api/v1/plants", domain: "infrastructure" },
  { method: "GET", path: "/api/v1/wind-farms", domain: "infrastructure" },
  { method: "GET", path: "/api/v1/charging/stations", domain: "charging" },
  { method: "GET", path: "/api/v1/charging/sessions", domain: "charging" },
  { method: "GET", path: "/api/v1/supply-chain/passports", domain: "supply-chain" },
  { method: "GET", path: "/api/v1/cross-chain/routes", domain: "cross-chain" },
  { method: "GET", path: "/api/v1/oracles/status", domain: "oracles" },
  { method: "POST", path: "/api/v1/pwrc/bridge/quote", domain: "pwrc", mutation: true },
  { method: "GET", path: "/api/v1/saas/apps", domain: "saas" },
  { method: "GET", path: "/api/v1/saas/tenant/{organizationId}", domain: "saas" },
  { method: "POST", path: "/api/v1/saas/entitlements/resolve", domain: "saas", mutation: true }
] as const;
