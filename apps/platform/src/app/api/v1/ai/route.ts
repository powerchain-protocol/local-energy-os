import { NextRequest, NextResponse } from "next/server";
import { gridLlmDefault } from "@powerchain/ai-core";
import { routeInference } from "@powerchain/ai-gateway";
import { planCopilotRequest } from "@powerchain/copilot";

export async function GET(){
  return NextResponse.json({data:{product:"PowerChain Copilot",version:"1.0.0",canonicalEndpoint:"/api/v1/copilot/registry"}});
}

export async function POST(req:NextRequest){
  const body=await req.json().catch(()=>null) as null|{prompt?:unknown;assetIds?:unknown};
  const prompt=typeof body?.prompt==="string"?body.prompt.trim():"";
  if(!prompt)return NextResponse.json({error:"A prompt is required"},{status:400});

  const contexts=Array.isArray(body?.assetIds)
    ? body.assetIds.filter((id):id is string=>typeof id==="string").slice(0,12).map(id=>({type:"ASSET" as const,id,label:id,source:"USER" as const}))
    : [];
  const plan=planCopilotRequest({request:prompt,mode:"ANALYZE",contexts});
  const inference=await routeInference({
    requestId:`compat_${crypto.randomUUID().replaceAll("-","")}`,
    userId:"compatibility-api",
    message:`PowerChain Copilot compatibility request. Do not invent live data or evidence.\n${prompt}`,
    model:gridLlmDefault,
  });
  return NextResponse.json({data:{summary:inference.text,plan,recommendations:["Open PowerChain Copilot for contextual agent activity and approval-safe actions."],confidence:null}});
}
