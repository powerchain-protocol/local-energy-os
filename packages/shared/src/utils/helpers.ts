export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
export function shortenAddress(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
export function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
export function safeJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}
