export type StorageNamespace = "evidence" | "reports" | "exports" | "integrations";

export interface StoredObjectMetadata {
  contentType?: string;
  sha256?: string;
  organizationId?: string;
  correlationId?: string;
  tags?: Record<string, string>;
}

export interface PutObjectInput {
  namespace: StorageNamespace;
  key: string;
  body: Uint8Array;
  metadata?: StoredObjectMetadata;
}

export interface StoredObject {
  namespace: StorageNamespace;
  key: string;
  body: Uint8Array;
  metadata?: StoredObjectMetadata;
  storedAt: string;
}

export interface ObjectStorage {
  put(input: PutObjectInput): Promise<StoredObject>;
  get(namespace: StorageNamespace, key: string): Promise<StoredObject | null>;
  delete(namespace: StorageNamespace, key: string): Promise<boolean>;
}

export const STORAGE_CAPABILITIES = {
  namespaces: ["evidence", "reports", "exports", "integrations"],
  rawTelemetry: "external-timeseries-or-data-lake",
  canonicalDatabase: "postgresql",
  providerModel: "adapter"
} as const;

export function normalizeStorageKey(key: string): string {
  const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("../") || normalized === "..") {
    throw new Error("STORAGE_INVALID_KEY");
  }
  return normalized;
}

export function energyEvidenceKey(input: { organizationId: string; siteId: string; proofId: string }): string {
  return normalizeStorageKey(`${input.organizationId}/${input.siteId}/energy-proofs/${input.proofId}.json`);
}
