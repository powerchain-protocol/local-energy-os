import type { TelemetryFreshness } from "@powerchain/telemetry";

export type DePinNodeState = "ACTIVE" | "DEGRADED" | "OFFLINE" | "QUARANTINED" | "UNVERIFIED";

export interface DePinNode {
  id: string;
  network: string;
  operatorId: string;
  locationRef?: string;
  capabilities: string[];
  state: DePinNodeState;
  freshness: TelemetryFreshness;
  lastSeenAt?: string;
}

export interface DePinAttestation {
  id: string;
  nodeId: string;
  kind: "IDENTITY" | "LOCATION" | "UPTIME" | "TELEMETRY" | "ENERGY";
  issuer: string;
  observedAt: string;
  digest: string;
  valid: boolean;
}

export interface DePinProvider {
  readonly id: string;
  listNodes(organizationId: string, signal?: AbortSignal): Promise<DePinNode[]>;
  getNode(nodeId: string, signal?: AbortSignal): Promise<DePinNode | null>;
  attestations(nodeId: string, signal?: AbortSignal): Promise<DePinAttestation[]>;
}

export class DePinService {
  constructor(private readonly provider: DePinProvider) {}
  listNodes(organizationId: string, signal?: AbortSignal) { return this.provider.listNodes(organizationId, signal); }
  getNode(nodeId: string, signal?: AbortSignal) { return this.provider.getNode(nodeId, signal); }
  attestations(nodeId: string, signal?: AbortSignal) { return this.provider.attestations(nodeId, signal); }
  get providerId() { return this.provider.id; }
}
