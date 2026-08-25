import type { SystemPublicConfig } from "./types/status";

export function redactUrlHost(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.hostname;
  } catch {
    return undefined;
  }
}

export function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === "true";
}

export type PublicConfigResolver = () => SystemPublicConfig;
