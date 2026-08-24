export type PlatformLayerId =
  | "foundation"
  | "cloud"
  | "fabric"
  | "runtime"
  | "studios"
  | "hubs"
  | "marketplaces"
  | "intelligence"
  | "experience"
  | "ecosystem";

export type PlatformCapabilityStatus = "available" | "preview" | "planned";

export interface PlatformCapability {
  id: string;
  name: string;
  description: string;
  href?: string;
  status: PlatformCapabilityStatus;
  services: string[];
}

export interface PlatformLayer {
  id: PlatformLayerId;
  name: string;
  eyebrow: string;
  description: string;
  capabilities: PlatformCapability[];
}

export interface PlatformCatalogSummary {
  layers: number;
  capabilities: number;
  available: number;
  preview: number;
  planned: number;
}
