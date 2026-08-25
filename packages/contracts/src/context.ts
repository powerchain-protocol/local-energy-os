export type EnergyContextType =
  | "HOUSEHOLD"
  | "COMMUNITY"
  | "COMPANY"
  | "CLIENT"
  | "GRID_OPERATOR";

export interface RequestContext {
  requestId: string;
  correlationId: string;
  organizationId?: string;
  tenantId?: string;
  workspaceId?: string;
  contextType?: EnergyContextType;
}
