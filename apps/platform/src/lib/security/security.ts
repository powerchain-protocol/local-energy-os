import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "powerchain_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const securityHeaders = {
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export function randomToken(bytes = 32): string { return randomBytes(bytes).toString("base64url"); }
export function hashToken(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function sanitizeRedirect(value: unknown, fallback = "/"): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
