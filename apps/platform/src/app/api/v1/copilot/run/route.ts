import { NextResponse } from "next/server";
import { gridLlmDefault } from "@powerchain/ai-core";
import { routeInference } from "@powerchain/ai-gateway";
import {
  createCopilotActionDraft,
  planCopilotRequest,
  type CopilotContextRef,
  type CopilotMode,
} from "@powerchain/copilot";
import { saveCopilotAction } from "@/lib/copilot/action-store";
import { getCopilotIdentity } from "@/lib/copilot/identity";

const MODES=new Set<CopilotMode>(["ASK","ANALYZE","RESEARCH","ACT"]);

export async function POST(request:Request){
  const body=await request.json().catch(()=>null) as null|{message?:unknown;mode?:unknown;contexts?:unknown};
  const message=typeof body?.message==="string"?body.message.trim():"";
  const mode=typeof body?.mode==="string"&&MODES.has(body.mode as CopilotMode)?body.mode as CopilotMode:"ASK";
  const contexts=Array.isArray(body?.contexts)?body.contexts as CopilotContextRef[]:[];
  if(!message)return NextResponse.json({error:{code:"COPILOT_REQUEST_REQUIRED",message:"A Copilot request is required"}},{status:400});
  if(message.length>2000)return NextResponse.json({error:{code:"COPILOT_REQUEST_TOO_LONG",message:"Copilot requests are limited to 2,000 characters"}},{status:400});

  const identity=await getCopilotIdentity();
  if(mode==="ACT"&&!identity)return NextResponse.json({error:{code:"UNAUTHENTICATED",message:"Authentication is required to create an action draft"}},{status:401});
  const plan=planCopilotRequest({request:message,mode,contexts});
  const contextText=plan.contexts.length
    ? plan.contexts.map(item=>`${item.type}:${item.label}`).join(", ")
    : "PowerChain workspace";

  const inference=await routeInference({
    requestId:`copilot_${crypto.randomUUID().replaceAll("-","")}`,
    userId:identity?.userId??"anonymous",
    message:[
      `PowerChain Copilot mode: ${mode}.`,
      `Context: ${contextText}.`,
      `Agents: ${plan.steps.map(step=>step.agentName).join(", ")}.`,
      "Do not invent telemetry, prices, balances, evidence, signatures, transactions, settlement state, sources, or confidence.",
      "For ACT mode prepare a draft only. Never sign a wallet transaction or silently move funds.",
      `Operator request: ${message}`,
    ].join("\n"),
    model:gridLlmDefault,
  });

  const activity=plan.steps.map(step=>({
    ...step,
    status:inference.executionMode==="provider"?"COMPLETED" as const:"BLOCKED" as const,
  }));
  const action=mode==="ACT"
    ? await saveCopilotAction(identity!.organizationId,identity!.userId,createCopilotActionDraft({
        title:message.length>72?`${message.slice(0,69)}…`:message,
        description:`Prepared by PowerChain Copilot for human review. ${plan.requiresWalletSignature?"Wallet signature is required after explicit approval.":"No wallet signature is requested by this draft."}`,
        createdBy:"operator-agent",
        contexts:plan.contexts,
        risk:plan.requiresWalletSignature?"HIGH":"MEDIUM",
        requiresWalletSignature:plan.requiresWalletSignature,
      }))
    : null;

  return NextResponse.json({
    data:{
      plan:{...plan,steps:activity},
      answer:inference.text,
      provider:inference.provider,
      modelId:inference.modelId,
      executionMode:inference.executionMode,
      action,
      approvalBoundary:{
        humanApprovalRequired:Boolean(action),
        walletSignatureRequired:Boolean(action?.requiresWalletSignature),
        agentCanSign:false,
      },
    },
  },{status:201,headers:{"Cache-Control":"no-store"}});
}
