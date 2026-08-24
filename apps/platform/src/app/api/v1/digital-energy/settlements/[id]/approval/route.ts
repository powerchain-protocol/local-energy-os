import type { SettlementApprovalDecision } from "@powerchain/energy-controls";
import { approveEnergySettlement } from "@/lib/digital-energy/operations-server";
import {
  digitalEnergyError,
  digitalEnergyResponse,
  enforceDigitalEnergyRateLimit,
  getDigitalEnergyContext,
  requireDigitalEnergySettlementApprover,
  requireIdempotencyKey,
} from "@/lib/digital-energy/server";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const context=await getDigitalEnergyContext(request);
  try{
    enforceDigitalEnergyRateLimit(request,context,true);
    requireDigitalEnergySettlementApprover(context);
    const{id}=await params;
    const body=await request.json() as {
      approvalId?:string;
      decision:SettlementApprovalDecision;
      reviewHash:string;
      note?:string;
    };
    const decision=body.decision;
    if(decision!=="APPROVED"&&decision!=="REJECTED"){
      throw Object.assign(new Error("Settlement decision must be APPROVED or REJECTED"),{code:"SETTLEMENT_APPROVAL_DECISION_INVALID"});
    }
    const reviewHash=String(body.reviewHash||"").trim().toLowerCase();
    if(!/^[a-f0-9]{64}$/.test(reviewHash)){
      throw Object.assign(new Error("Settlement reviewHash must be a 64-character SHA-256 hex digest"),{code:"SETTLEMENT_REVIEW_HASH_INVALID"});
    }
    const note=body.note?String(body.note).trim():undefined;
    if(note&&note.length>1000){
      throw Object.assign(new Error("Settlement approval note exceeds 1000 characters"),{code:"SETTLEMENT_APPROVAL_NOTE_TOO_LONG"});
    }
    const data=await approveEnergySettlement(context,{
      settlementId:id,
      approvalId:String(body.approvalId||`approval_${crypto.randomUUID()}`),
      decision,
      reviewHash,
      ...(note?{note}:{}),
      idempotencyKey:requireIdempotencyKey(request),
    });
    return digitalEnergyResponse(data,context);
  }catch(error){
    return digitalEnergyError(error,context);
  }
}
