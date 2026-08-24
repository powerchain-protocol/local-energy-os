import { NextResponse } from "next/server";
import { listCopilotActions } from "@/lib/copilot/action-store";
import { getCopilotIdentity } from "@/lib/copilot/identity";

export async function GET(){
  const identity=await getCopilotIdentity();
  if(!identity)return NextResponse.json({error:{code:"UNAUTHENTICATED",message:"Authentication is required"}},{status:401});
  return NextResponse.json({data:await listCopilotActions(identity.organizationId)},{headers:{"Cache-Control":"no-store"}});
}
