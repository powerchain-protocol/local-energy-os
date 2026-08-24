export interface ScadaTag {
  tag: string;
  value: unknown;
  timestamp: string;
  quality: string;
}
export const SCADA_SECURITY_BOUNDARY = {
  browserAccess: false,
  defaultMode: "read-only",
  chainWritesFromOt: false,
  requiresAllowlist: true,
  preserveQualityCodes: true,
} as const;
