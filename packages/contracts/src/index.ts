export type ParticipantType = "PROSUMER" | "CONSUMER" | "CLIENT" | "GRID_OPERATOR";
export type EnergyContextType = "HOUSEHOLD" | "COMMUNITY" | "COMPANY" | "CLIENT" | "GRID_OPERATOR";
export type EnergySource = "SOLAR" | "WIND" | "HYDRO" | "GEOTHERMAL" | "BIOMASS" | "GRID" | "STORAGE_DISCHARGE";
export type EnergyRwaUnit = "KWH" | "MWH";
export type PositionState = "AVAILABLE" | "RESERVED" | "COMMITTED" | "DELIVERING" | "DELIVERED" | "SETTLING" | "RETIRED" | "DISPUTED";
export type BridgeState = "CREATED" | "SOURCE_LOCKED" | "ATTESTED" | "DESTINATION_MINTED" | "RETURN_BURNED" | "SOURCE_RELEASED" | "FAILED";

export interface RequestContext {
  requestId: string;
  correlationId: string;
  organizationId?: string;
  tenantId?: string;
  workspaceId?: string;
  contextType?: EnergyContextType;
}

export interface ApiSuccess<T> { data: T; meta: { requestId: string; generatedAt: string } }
export interface ApiFailure { error: { code: string; message: string; requestId: string; details?: Record<string, unknown> } }
