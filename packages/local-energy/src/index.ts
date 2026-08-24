export const LOCAL_ENERGY_VERSION = "1.0.0" as const;
export const LOCAL_ENERGY_CANONICAL_UNIT = "Wh" as const;

export type LocalEnergyParticipantType =
  | "PROSUMER"
  | "CONSUMER"
  | "CLIENT"
  | "GRID_OPERATOR";

export type LocalEnergyOperatorRole =
  | "ENERGY_COMPANY"
  | "UTILITY"
  | "AGGREGATOR"
  | "PLANT_OPERATOR"
  | "WIND_OPERATOR"
  | "SOLAR_OPERATOR"
  | "CHARGING_OPERATOR"
  | "METER_OPERATOR"
  | "GRID_OPERATOR"
  | "ENERGY_COMMUNITY";

export type LocalEnergyContext =
  | "HOUSEHOLD"
  | "COMMUNITY"
  | "COMPANY"
  | "CLIENT"
  | "GRID_OPERATOR"
  | "PORTFOLIO"
  | "VPP";

export type LocalEnergySubsystemState =
  | "OPERATIONAL"
  | "DEGRADED"
  | "DELAYED"
  | "UNAVAILABLE"
  | "MAINTENANCE";

export interface LocalEnergySystemStatus {
  telemetry: LocalEnergySubsystemState;
  market: LocalEnergySubsystemState;
  grid: LocalEnergySubsystemState;
  settlement: LocalEnergySubsystemState;
  solana: LocalEnergySubsystemState;
  sui: LocalEnergySubsystemState;
}

export interface LocalEnergyCommunityAggregate {
  dataState:"DEMO"|"LIVE"|"UNAVAILABLE";
  source:string;
  members:number|null;
  producers:number|null;
  consumers:number|null;
  batteries:number|null;
  localSupplyWh:bigint|null;
  localDemandWh:bigint|null;
  matchedPercent:number|null;
  averagePrice:number|null;
  carbonAvoidedKg:number|null;
}

export interface LocalEnergyOverview {
  version:typeof LOCAL_ENERGY_VERSION;
  canonicalUnit:typeof LOCAL_ENERGY_CANONICAL_UNIT;
  community:LocalEnergyCommunityAggregate;
  market:{
    activeListings:number;
    activeOrders:number;
    deliveredWh:bigint;
    openFlexibilitySignals:number;
  };
  status:LocalEnergySystemStatus;
  principles:{
    physicalEnergyAuthoritative:true;
    blockchainSettlementDoesNotProveDelivery:true;
    batteryDischargeCreatesNoNewRenewableProvenance:true;
    tokenizationOptional:true;
  };
}

export interface LocalFlexibilitySignal {
  id: string;
  organizationId: string;
  gridAreaId: string;
  direction: "INCREASE_EXPORT" | "REDUCE_EXPORT" | "INCREASE_IMPORT" | "REDUCE_IMPORT";
  requestedWh: bigint;
  availableWh: bigint;
  startsAt: Date;
  endsAt: Date;
  state: "OPEN" | "RESERVED" | "DELIVERING" | "COMPLETED" | "CANCELLED";
}

export function kwhToWh(kwh:number):bigint{
  if(!Number.isFinite(kwh)||kwh<0)throw new Error("LOCAL_ENERGY_KWH_INVALID");
  return BigInt(Math.round(kwh*1_000));
}

export function whToKwh(wh:bigint):number{
  return Number(wh)/1_000;
}

export function localEnergyBalance(input:{supplyWh:bigint;demandWh:bigint}){
  const netWh=input.supplyWh-input.demandWh;
  return{
    netWh,
    state:netWh>0n?"SURPLUS" as const:netWh<0n?"DEFICIT" as const:"BALANCED" as const,
  };
}

export function assertGridConstrainedCommitment(input:{
  requestedWh:bigint;
  availableWh:bigint;
  exportLimitWh?:bigint;
  importLimitWh?:bigint;
  direction:"EXPORT"|"IMPORT";
}){
  if(input.requestedWh<=0n)throw new Error("LOCAL_ENERGY_COMMITMENT_MUST_BE_POSITIVE");
  if(input.requestedWh>input.availableWh)throw new Error("LOCAL_ENERGY_COMMITMENT_EXCEEDS_AVAILABLE");
  if(input.direction==="EXPORT"&&input.exportLimitWh!==undefined&&input.requestedWh>input.exportLimitWh){
    throw new Error("LOCAL_ENERGY_EXPORT_LIMIT_EXCEEDED");
  }
  if(input.direction==="IMPORT"&&input.importLimitWh!==undefined&&input.requestedWh>input.importLimitWh){
    throw new Error("LOCAL_ENERGY_IMPORT_LIMIT_EXCEEDED");
  }
}

export const LOCAL_ENERGY_FLOW = [
  "MEASURE",
  "VERIFY",
  "LOCATE",
  "PROVE",
  "POSITION",
  "RESERVE",
  "ROUTE",
  "TRADE",
  "DELIVER",
  "RECONCILE",
  "SETTLE",
  "RETIRE",
  "REWARD",
] as const;


export type LocalEnergyListingMode = "BUY" | "SELL" | "RENT";
export type LocalEnergySource = "SOLAR" | "WIND" | "HYDRO" | "BATTERY" | "MIXED";
export type LocalEnergySettlementAsset = "USDC" | "EURC" | "FIAT_EUR" | "PWRC";

export type LocalEnergyOrderState =
  | "REVIEW_REQUIRED"
  | "RESERVED"
  | "DELIVERING"
  | "DELIVERED"
  | "RECONCILED"
  | "SETTLEMENT_READY"
  | "SETTLED"
  | "CANCELLED"
  | "DISPUTED";

export type LocalEnergyOrderAction =
  | "CONFIRM_RESERVATION"
  | "START_DELIVERY"
  | "RECORD_DELIVERY"
  | "RECONCILE"
  | "MARK_SETTLEMENT_READY"
  | "MARK_SETTLED"
  | "CANCEL"
  | "DISPUTE";

export interface LocalEnergyListingRecord {
  id:string;
  organizationId:string;
  sellerOrganizationId:string;
  sellerName:string;
  title:string;
  mode:LocalEnergyListingMode;
  source:LocalEnergySource;
  gridAreaId:string;
  location:string;
  quantityWh:bigint;
  availableWh:bigint;
  minimumWh:bigint;
  exportLimitWh?:bigint;
  priceMicrosPerKwh:bigint;
  currency:"EUR"|"USD";
  settlementAsset:LocalEnergySettlementAsset;
  renewablePercent:number;
  verified:boolean;
  meterVerified:boolean;
  deliveryStart:Date;
  deliveryEnd:Date;
  state:"ACTIVE"|"PAUSED"|"COMPLETED"|"CANCELLED";
}

export interface LocalEnergyOrderRecord {
  id:string;
  organizationId:string;
  listingId:string;
  buyerId:string;
  quantityWh:bigint;
  deliveredWh:bigint;
  expectedWh:bigint;
  varianceWh:bigint;
  subtotalMicros:bigint;
  networkFeeMicros:bigint;
  reserveMicros:bigint;
  totalMicros:bigint;
  currency:"EUR"|"USD";
  settlementAsset:LocalEnergySettlementAsset;
  state:LocalEnergyOrderState;
  reservationReference?:string;
  meterEvidenceRoot?:string;
  settlementReference?:string;
  createdAt:Date;
  updatedAt:Date;
}

const LOCAL_ENERGY_ORDER_TRANSITIONS:Record<LocalEnergyOrderState,readonly LocalEnergyOrderState[]>={
  REVIEW_REQUIRED:["RESERVED","CANCELLED"],
  RESERVED:["DELIVERING","CANCELLED","DISPUTED"],
  DELIVERING:["DELIVERED","DISPUTED"],
  DELIVERED:["RECONCILED","DISPUTED"],
  RECONCILED:["SETTLEMENT_READY","DISPUTED"],
  SETTLEMENT_READY:["SETTLED","DISPUTED"],
  SETTLED:[],
  CANCELLED:[],
  DISPUTED:["CANCELLED"],
};

export function assertLocalEnergyOrderTransition(current:LocalEnergyOrderState,next:LocalEnergyOrderState){
  if(current===next)return;
  if(!LOCAL_ENERGY_ORDER_TRANSITIONS[current].includes(next)){
    throw new Error(`LOCAL_ENERGY_ORDER_TRANSITION_INVALID:${current}->${next}`);
  }
}

export function assertMeterEvidence(input:{deliveredWh:bigint;meterEvidenceRoot?:string}){
  if(input.deliveredWh<=0n)throw new Error("LOCAL_ENERGY_DELIVERED_WH_MUST_BE_POSITIVE");
  if(!input.meterEvidenceRoot?.trim())throw new Error("LOCAL_ENERGY_METER_EVIDENCE_REQUIRED");
}

export function reconcileLocalEnergyDelivery(input:{
  expectedWh:bigint;
  deliveredWh:bigint;
  toleranceWh:bigint;
}){
  if(input.expectedWh<=0n)throw new Error("LOCAL_ENERGY_EXPECTED_WH_MUST_BE_POSITIVE");
  if(input.deliveredWh<0n)throw new Error("LOCAL_ENERGY_DELIVERED_WH_INVALID");
  if(input.toleranceWh<0n)throw new Error("LOCAL_ENERGY_TOLERANCE_WH_INVALID");
  const varianceWh=input.deliveredWh-input.expectedWh;
  const absoluteVarianceWh=varianceWh<0n?-varianceWh:varianceWh;
  return{
    varianceWh,
    absoluteVarianceWh,
    withinTolerance:absoluteVarianceWh<=input.toleranceWh,
  };
}

export function assertLocalEnergySettlementReady(input:{
  state:LocalEnergyOrderState;
  meterEvidenceRoot?:string;
  deliveredWh:bigint;
}){
  if(input.state!=="SETTLEMENT_READY")throw new Error("LOCAL_ENERGY_SETTLEMENT_NOT_READY");
  assertMeterEvidence({deliveredWh:input.deliveredWh,meterEvidenceRoot:input.meterEvidenceRoot});
}

export function calculateLocalEnergyPricing(input:{
  quantityWh:bigint;
  priceMicrosPerKwh:bigint;
  networkFeeBps?:bigint;
  reserveBps?:bigint;
}){
  if(input.quantityWh<=0n)throw new Error("LOCAL_ENERGY_QUANTITY_MUST_BE_POSITIVE");
  if(input.priceMicrosPerKwh<0n)throw new Error("LOCAL_ENERGY_PRICE_INVALID");
  const networkFeeBps=input.networkFeeBps??125n;
  const reserveBps=input.reserveBps??200n;
  const subtotalMicros=(input.quantityWh*input.priceMicrosPerKwh+500n)/1_000n;
  const networkFeeMicros=(subtotalMicros*networkFeeBps+5_000n)/10_000n;
  const reserveMicros=(subtotalMicros*reserveBps+5_000n)/10_000n;
  return{
    subtotalMicros,
    networkFeeMicros,
    reserveMicros,
    totalMicros:subtotalMicros+networkFeeMicros+reserveMicros,
  };
}
