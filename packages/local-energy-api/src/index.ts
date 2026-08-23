export const LOCAL_ENERGY_API_PREFIX = "/api/v1" as const;

export const LOCAL_ENERGY_ROUTES = [
  "/energy-measurements",
  "/energy-proofs",
  "/energy-batches",
  "/energy-positions",
  "/energy-reservations",
  "/energy-retirements",
  "/energy-orders",
  "/trades",
  "/deliveries",
  "/settlements",
  "/grid",
  "/flexibility",
  "/vpp",
  "/pwrc",
  "/pwrc/bridge",
  "/oracle",
  "/x402",
] as const;

export interface ApiEnvelope<T> {
  data: T;
  requestId: string;
  version: "1.0.0";
}

export function parseBigIntField(value: unknown, field: string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^-?\d+$/.test(value)) return BigInt(value);
  throw new TypeError(`${field} must be an integer encoded as a decimal string`);
}

export function serializeBigInts<T>(value: T): any {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serializeBigInts);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        serializeBigInts(item),
      ]),
    );
  }
  return value;
}

export function envelope<T>(data: T, requestId: string): ApiEnvelope<any> {
  return { data: serializeBigInts(data), requestId, version: "1.0.0" };
}
