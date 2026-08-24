import { NextResponse } from "next/server";
import { rejectCopilotAction } from "@/lib/copilot/action-store";
import { getCopilotIdentity } from "@/lib/copilot/identity";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const identity=await getCopilotIdentity();
  if(!identity)return NextResponse.json({error:{code:"UNAUTHENTICATED",message:"Authentication is required"}},{status:401});
  const{id}=await params;
  try{
    return NextResponse.json({data:await rejectCopilotAction(identity.organizationId,identity.userId,id)});
  }catch(error){
    const domainCode=error&&typeof error==="object"&&"code" in error?String((error as {code?:unknown}).code):"COPILOT_ACTION_REJECTION_FAILED";
    const status=domainCode==="COPILOT_ACTION_DECISION_CONFLICT"?409:domainCode==="COPILOT_ACTION_NOT_FOUND"?404:400;
    return NextResponse.json({error:{code:domainCode,message:error instanceof Error?error.message:"Unable to reject action"}},{status});
  }
}
