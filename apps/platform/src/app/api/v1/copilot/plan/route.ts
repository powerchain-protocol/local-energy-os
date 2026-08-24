import { NextResponse } from "next/server";
import { planCopilotRequest, type CopilotContextRef, type CopilotMode } from "@powerchain/copilot";

const MODES=new Set<CopilotMode>(["ASK","ANALYZE","RESEARCH","ACT"]);

export async function POST(request:Request){
  const body=await request.json().catch(()=>null) as null|{message?:unknown;mode?:unknown;contexts?:unknown};
  const message=typeof body?.message==="string"?body.message.trim():"";
  const mode=typeof body?.mode==="string"&&MODES.has(body.mode as CopilotMode)?body.mode as CopilotMode:"ASK";
  const contexts=Array.isArray(body?.contexts)?body.contexts as CopilotContextRef[]:[];
  if(!message)return NextResponse.json({error:{code:"COPILOT_REQUEST_REQUIRED",message:"A Copilot request is required"}},{status:400});
  if(message.length>2000)return NextResponse.json({error:{code:"COPILOT_REQUEST_TOO_LONG",message:"Copilot requests are limited to 2,000 characters"}},{status:400});
  try{
    return NextResponse.json({data:planCopilotRequest({request:message,mode,contexts})});
  }catch(error){
    return NextResponse.json({error:{code:"COPILOT_PLAN_FAILED",message:error instanceof Error?error.message:"Unable to plan Copilot request"}},{status:400});
  }
}
