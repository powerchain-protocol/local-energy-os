import { sha256Hex } from "@powerchain/crypto-utils";

function normalize(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === "bigint") return value.toString(10);
  if (value instanceof Date) return value.toISOString();
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Non-finite numbers are not serializable");
    return value;
  }
  if (typeof value === "undefined") return undefined;
  if (Array.isArray(value)) return value.map((item) => normalize(item, seen));
  if (typeof value === "object") {
    if (seen.has(value as object)) throw new TypeError("Cyclic objects are not serializable");
    seen.add(value as object);
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input).sort()) {
      const normalized = normalize(input[key], seen);
      if (normalized !== undefined) output[key] = normalized;
    }
    seen.delete(value as object);
    return output;
  }
  throw new TypeError(`Unsupported serialization type: ${typeof value}`);
}

/** Stable deterministic JSON used for PET-20 hashes, evidence commitments, and review hashes. */
export function deterministicSerialize(value: unknown): string {
  return JSON.stringify(normalize(value, new WeakSet()));
}

export function deterministicSha256(value: unknown): string {
  return sha256Hex(deterministicSerialize(value));
}
