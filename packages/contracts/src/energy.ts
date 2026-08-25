export type ParticipantType = "PROSUMER" | "CONSUMER" | "CLIENT" | "GRID_OPERATOR";

export type EnergySource =
  | "SOLAR"
  | "WIND"
  | "HYDRO"
  | "GEOTHERMAL"
  | "BIOMASS"
  | "GRID"
  | "STORAGE_DISCHARGE";

export type EnergyRwaUnit = "KWH" | "MWH";

export type PositionState =
  | "AVAILABLE"
  | "RESERVED"
  | "COMMITTED"
  | "DELIVERING"
  | "DELIVERED"
  | "SETTLING"
  | "RETIRED"
  | "DISPUTED";

/** Decimal-string JSON representation used for bigint quantities at API boundaries. */
export type BaseUnitString = string;
