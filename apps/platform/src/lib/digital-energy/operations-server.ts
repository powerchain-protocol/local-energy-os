import "server-only";
import { PostgresEnergyOperationsRepository } from "@powerchain/database";
import type { SettlementApprovalDecision } from "@powerchain/energy-controls";
import {
  createDemoOperationsSnapshot,
  DigitalEnergyOperationsMemoryStore,
  type EnergyOperationsSnapshot,
  type EnergySettlementNetwork,
  type EnergySettlementState,
  type SettlementAsset,
} from "@powerchain/energy-operations";
import { databaseConfigured, writeDigitalEnergyAudit, type DigitalEnergyRequestContext } from "./server";

const globalOperations = globalThis as unknown as {
  digitalEnergyOperationsStores?: Map<string, DigitalEnergyOperationsMemoryStore>;
  digitalEnergyOperationsRepository?: PostgresEnergyOperationsRepository;
};

globalOperations.digitalEnergyOperationsStores ??= new Map();
globalOperations.digitalEnergyOperationsRepository ??= new PostgresEnergyOperationsRepository();

function repository(){ return globalOperations.digitalEnergyOperationsRepository!; }
function demoStore(organizationId:string){
  const current=globalOperations.digitalEnergyOperationsStores!.get(organizationId);
  if(current)return current;
  const store=new DigitalEnergyOperationsMemoryStore(createDemoOperationsSnapshot(organizationId));
  globalOperations.digitalEnergyOperationsStores!.set(organizationId,store);
  return store;
}
function demoFallbackEnabled(){ return process.env.DIGITAL_ENERGY_ALLOW_DEMO_FALLBACK === "true"; }
function databaseUnavailable(error:unknown):never{
  const wrapped=new Error(error instanceof Error?error.message:"Digital Energy operations database unavailable") as Error & {code:string};
  wrapped.name="DIGITAL_ENERGY_DATABASE_UNAVAILABLE";
  wrapped.code="DIGITAL_ENERGY_DATABASE_UNAVAILABLE";
  throw wrapped;
}

export async function getEnergyOperationsSnapshot(context:DigitalEnergyRequestContext):Promise<EnergyOperationsSnapshot>{
  if(!databaseConfigured()){
    context.dataMode="DEMO";
    return demoStore(context.organizationId).snapshot(context.organizationId);
  }
  try{
    const snapshot=await repository().snapshot(context.organizationId);
    context.dataMode="LIVE";
    return snapshot;
  }catch(error){
    if(!demoFallbackEnabled())databaseUnavailable(error);
    context.dataMode="DEGRADED";
    return demoStore(context.organizationId).snapshot(context.organizationId);
  }
}

async function write<T>(context:DigitalEnergyRequestContext, live:()=>Promise<T>, demo:()=>T):Promise<T>{
  if(!databaseConfigured()){
    context.dataMode="DEMO";
    return demo();
  }
  context.dataMode="LIVE";
  try{return await live()}catch(error){
    if(error&&typeof error==="object"&&"code" in error)throw error;
    databaseUnavailable(error);
  }
}


export async function upsertDigitalTwinAsset(context:DigitalEnergyRequestContext,input:{id:string;siteId:string;assetType:import("@powerchain/energy-operations").DigitalTwinAssetType;label:string;gridAreaId?:string;observedAt:Date;powerW?:string;availabilityPpm?:string;stateOfChargePpm?:string;exportLimitW?:string;evidenceRoot?:string;maintenance?:boolean;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().upsertTwin({organizationId:context.organizationId,...input}),
    ()=>demoStore(context.organizationId).upsertTwin({organizationId:context.organizationId,...input}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.twin.updated",resource:"digital-twin-asset",resourceId:input.id,metadata:{siteId:input.siteId,assetType:input.assetType,observedAt:input.observedAt.toISOString(),evidenceRoot:input.evidenceRoot??null}});
  return data;
}

export async function createEnergyDelivery(context:DigitalEnergyRequestContext,input:{id:string;positionId:string;reservationId?:string;committedWh:string;intervalStart:Date;intervalEnd:Date;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().createDelivery({organizationId:context.organizationId,...input}),
    ()=>demoStore(context.organizationId).createDelivery({organizationId:context.organizationId,id:input.id,energyPositionId:input.positionId,...(input.reservationId?{reservationId:input.reservationId}:{}),committedWh:input.committedWh,intervalStart:input.intervalStart,intervalEnd:input.intervalEnd,idempotencyKey:input.idempotencyKey}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.delivery.created",resource:"energy-delivery",resourceId:input.id,metadata:{positionId:input.positionId,committedWh:input.committedWh,reservationId:input.reservationId??null}});
  return data;
}

export async function recordEnergyDelivery(context:DigitalEnergyRequestContext,input:{deliveryId:string;deliveredWh:string;meterEvidenceRoot:string;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().recordDelivery({organizationId:context.organizationId,...input}),
    ()=>demoStore(context.organizationId).recordDelivery({organizationId:context.organizationId,...input}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.delivery.recorded",resource:"energy-delivery",resourceId:input.deliveryId,metadata:{deliveredWh:input.deliveredWh,meterEvidenceRoot:input.meterEvidenceRoot}});
  return data;
}

export async function reconcileEnergyDelivery(context:DigitalEnergyRequestContext,input:{deliveryId:string;reconciliationId:string;toleranceWh:string;approve:boolean;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().reconcile({organizationId:context.organizationId,...input}),
    ()=>demoStore(context.organizationId).reconcile({organizationId:context.organizationId,...input}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.delivery.reconciled",resource:"energy-reconciliation",resourceId:input.reconciliationId,metadata:{deliveryId:input.deliveryId,toleranceWh:input.toleranceWh,approve:input.approve}});
  return data;
}

export async function prepareEnergySettlement(context:DigitalEnergyRequestContext,input:{settlementId:string;deliveryId:string;reconciliationId:string;asset:SettlementAsset;network:EnergySettlementNetwork;amountMinor:string;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().createSettlement({organizationId:context.organizationId,...input,createdBy:context.userId}),
    ()=>demoStore(context.organizationId).createSettlement({organizationId:context.organizationId,...input,createdBy:context.userId}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.settlement.prepared",resource:"energy-settlement",resourceId:input.settlementId,metadata:{deliveryId:input.deliveryId,reconciliationId:input.reconciliationId,asset:input.asset,network:input.network,amountMinor:input.amountMinor,reviewHash:(data as {reviewHash?:string}).reviewHash??null}});
  return data;
}

export async function transitionEnergySettlement(context:DigitalEnergyRequestContext,input:{settlementId:string;state:EnergySettlementState;reference?:string;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().transitionSettlement({organizationId:context.organizationId,...input}),
    ()=>demoStore(context.organizationId).transitionSettlement({organizationId:context.organizationId,...input}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.settlement.transitioned",resource:"energy-settlement",resourceId:input.settlementId,metadata:{state:input.state,reference:input.reference??null}});
  return data;
}


export async function approveEnergySettlement(context:DigitalEnergyRequestContext,input:{settlementId:string;approvalId:string;decision:SettlementApprovalDecision;reviewHash:string;note?:string;idempotencyKey:string}){
  const data=await write(context,
    ()=>repository().approveSettlement({organizationId:context.organizationId,...input,actorId:context.userId}),
    ()=>demoStore(context.organizationId).approveSettlement({organizationId:context.organizationId,...input,actorId:context.userId}),
  );
  await writeDigitalEnergyAudit(context,{action:"digital-energy.settlement.approval",resource:"energy-settlement",resourceId:input.settlementId,metadata:{approvalId:input.approvalId,decision:input.decision,reviewHash:input.reviewHash,note:input.note??null}});
  return data;
}

export async function getPendingEnergyOutbox(context:DigitalEnergyRequestContext,limit=100){
  if(!databaseConfigured()){
    context.dataMode="DEMO";
    return [];
  }
  try{
    context.dataMode="LIVE";
    return await repository().listPendingOutbox(context.organizationId,limit);
  }catch(error){
    if(!demoFallbackEnabled())databaseUnavailable(error);
    context.dataMode="DEGRADED";
    return [];
  }
}

export async function getDigitalEnergyOutboxPublisherHealth(){
  const base=String(process.env.POWERCHAIN_WORKERS_URL??"").trim().replace(/\/+$/,"");
  if(!base)return{state:"UNCONFIGURED" as const,configured:false,reason:"POWERCHAIN_WORKERS_URL is not configured"};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),1500);
  try{
    const response=await fetch(`${base}/api/v1/jobs/digital-energy-outbox`,{cache:"no-store",signal:controller.signal});
    if(!response.ok)return{state:"UNAVAILABLE" as const,configured:true,httpStatus:response.status};
    const body=await response.json() as {data?:Record<string,unknown>}&Record<string,unknown>;
    const data=(body&&typeof body==="object"&&"data" in body&&body.data&&typeof body.data==="object"?body.data:body) as Record<string,unknown>;
    const enabled=Boolean(data.enabled);
    const lastError=typeof data.lastError==="string"?data.lastError:undefined;
    return{
      state:lastError?"DEGRADED" as const:enabled?"OPERATIONAL" as const:"DISABLED" as const,
      configured:true,
      enabled,
      running:Boolean(data.running),
      sinkConfigured:Boolean(data.sinkConfigured),
      databaseConfigured:Boolean(data.databaseConfigured),
      claimed:Number(data.claimed??0),
      published:Number(data.published??0),
      failed:Number(data.failed??0),
      ...(typeof data.lastRunAt==="string"?{lastRunAt:data.lastRunAt}:{}),
      ...(typeof data.lastPublishedAt==="string"?{lastPublishedAt:data.lastPublishedAt}:{}),
      ...(lastError?{lastError}:{}),
    };
  }catch(error){
    return{state:"UNAVAILABLE" as const,configured:true,reason:error instanceof Error?error.message:"Workers service unavailable"};
  }finally{
    clearTimeout(timeout);
  }
}
