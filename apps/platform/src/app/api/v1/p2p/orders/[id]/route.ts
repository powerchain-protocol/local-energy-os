import { z } from "zod";
import { kwhToWh, type LocalEnergyOrderAction } from "@powerchain/local-energy";
import {
  applyLocalEnergyOrderAction,
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  getLocalEnergyOrder,
  localEnergyError,
  localEnergyResponse,
  publicLocalEnergyOrder,
  requireLocalEnergyIdempotencyKey,
} from "@/lib/local-energy/server";

const actionSchema=z.object({
  action:z.enum(["CONFIRM_RESERVATION","START_DELIVERY","RECORD_DELIVERY","RECONCILE","MARK_SETTLEMENT_READY","MARK_SETTLED","CANCEL","DISPUTE"]).optional(),
  status:z.enum(["escrowed","metering","settled","cancelled"]).optional(),
  signature:z.string().min(8).max(256).optional(),
  reservationReference:z.string().min(8).max(256).optional(),
  meterReadingId:z.string().min(3).max(256).optional(),
  meterEvidenceRoot:z.string().min(3).max(512).optional(),
  deliveredKwh:z.number().positive().max(1_000_000).optional(),
  toleranceKwh:z.number().nonnegative().max(100_000).optional(),
  settlementReference:z.string().min(8).max(256).optional(),
}).refine(value=>Boolean(value.action||value.status),{message:"action is required"});

function resolveAction(input:z.infer<typeof actionSchema>):LocalEnergyOrderAction{
  if(input.action)return input.action;
  switch(input.status){
    case"escrowed":return"CONFIRM_RESERVATION";
    case"metering":return"START_DELIVERY";
    case"cancelled":return"CANCEL";
    case"settled":return"MARK_SETTLED";
    default:throw new Error("LOCAL_ENERGY_ORDER_ACTION_REQUIRED");
  }
}

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    const{id}=await params;
    const data=await getLocalEnergyOrder(context,id);
    if(!data)throw Object.assign(new Error("Local Energy order not found"),{code:"LOCAL_ENERGY_ORDER_NOT_FOUND"});
    return localEnergyResponse(publicLocalEnergyOrder(data),context);
  }catch(error){
    return localEnergyError(error,context);
  }
}

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context,true);
    const idempotencyKey=requireLocalEnergyIdempotencyKey(request);
    const{id}=await params;
    const parsed=actionSchema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)throw Object.assign(new Error("Invalid Local Energy order action"),{code:"LOCAL_ENERGY_ORDER_ACTION_INVALID"});
    const input=parsed.data;
    const action=resolveAction(input);

    // Legacy "settled" updates are deliberately not allowed to jump over
    // metered delivery, reconciliation, and settlement-ready controls.
    const updated=await applyLocalEnergyOrderAction(context,{
      id,
      action,
      idempotencyKey,
      ...(input.reservationReference||input.signature?{reservationReference:input.reservationReference??input.signature}:{}),
      ...(input.deliveredKwh!==undefined?{deliveredWh:kwhToWh(input.deliveredKwh)}:{}),
      ...(input.meterEvidenceRoot||input.meterReadingId?{meterEvidenceRoot:input.meterEvidenceRoot??input.meterReadingId}:{}),
      ...(input.toleranceKwh!==undefined?{toleranceWh:kwhToWh(input.toleranceKwh)}:{}),
      ...(input.settlementReference?{settlementReference:input.settlementReference}:{}),
    });
    return localEnergyResponse(publicLocalEnergyOrder(updated),context);
  }catch(error){
    return localEnergyError(error,context);
  }
}
