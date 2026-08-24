import { NextResponse } from "next/server";
import { recordCopilotWalletSignature } from "@/lib/copilot/action-store";
import { getCopilotIdentity } from "@/lib/copilot/identity";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const identity=await getCopilotIdentity();
  if(!identity)return NextResponse.json({error:{code:"UNAUTHENTICATED",message:"Authentication is required"}},{status:401});
  const{id}=await params;
  const body=await request.json().catch(()=>null) as null|{walletSignatureReference?:unknown};
  const walletSignatureReference=typeof body?.walletSignatureReference==="string"?body.walletSignatureReference.trim():"";
  if(walletSignatureReference.length<8||walletSignatureReference.length>256){
    return NextResponse.json({error:{code:"COPILOT_WALLET_REFERENCE_INVALID",message:"Provide the external wallet signature or transaction reference (8–256 characters)"}},{status:400});
  }
  try{
    return NextResponse.json({data:await recordCopilotWalletSignature(identity.organizationId,identity.userId,id,walletSignatureReference)});
  }catch(error){
    const code=error&&typeof error==="object"&&"code" in error?String((error as {code?:unknown}).code):"COPILOT_WALLET_REFERENCE_FAILED";
    const status=code==="COPILOT_ACTION_DECISION_CONFLICT"?409:code==="COPILOT_ACTION_NOT_FOUND"?404:400;
    return NextResponse.json({error:{code,message:error instanceof Error?error.message:"Unable to record external wallet signature"}},{status});
  }
}
