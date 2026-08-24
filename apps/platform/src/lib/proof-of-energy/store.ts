import type{EnergyAttestation,EnergyMeasurement,EnergyTokenRecord,SettlementRecord}from"@/types/proof-of-energy";
export const measurementStore=new Map<string,EnergyMeasurement>();export const attestationStore=new Map<string,EnergyAttestation>();export const tokenStore=new Map<string,EnergyTokenRecord>();export const settlementStore=new Map<string,SettlementRecord>();
