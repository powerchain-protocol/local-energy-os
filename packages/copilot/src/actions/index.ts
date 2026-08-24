import type { CopilotActionDraft, CopilotActionState, CopilotAgentId, CopilotContextRef } from "../types";

const transitions: Record<CopilotActionState, readonly CopilotActionState[]> = {
  DRAFT:["REVIEW_REQUIRED","REJECTED"],
  REVIEW_REQUIRED:["APPROVED","REJECTED"],
  APPROVED:["AWAITING_WALLET","RECORDED","REJECTED"],
  AWAITING_WALLET:["SIGNED_EXTERNALLY","REJECTED"],
  SIGNED_EXTERNALLY:["RECORDED"],
  RECORDED:[],
  REJECTED:[],
};

export function createCopilotActionDraft(input:{
  title:string;
  description:string;
  createdBy:CopilotAgentId;
  contexts:CopilotContextRef[];
  risk:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL";
  requiresWalletSignature:boolean;
}):CopilotActionDraft{
  if(!input.title.trim())throw new Error("COPILOT_ACTION_TITLE_REQUIRED");
  const now=new Date().toISOString();
  return{
    id:`coact_${crypto.randomUUID().replaceAll("-","")}`,
    title:input.title.trim(),
    description:input.description.trim(),
    state:"REVIEW_REQUIRED",
    createdBy:input.createdBy,
    contexts:input.contexts,
    risk:input.risk,
    requiredPermission:"HUMAN_APPROVE",
    requiresWalletSignature:input.requiresWalletSignature,
    createdAt:now,
    updatedAt:now,
  };
}

export function transitionCopilotAction(
  action:CopilotActionDraft,
  next:CopilotActionState,
  input:{humanApproved?:boolean;humanApprovedBy?:string;rejectedBy?:string;walletSignatureReference?:string}={},
):CopilotActionDraft{
  if(action.state===next)return action;
  if(!transitions[action.state].includes(next))throw new Error(`COPILOT_ACTION_TRANSITION_INVALID:${action.state}->${next}`);

  if(next==="APPROVED"&&(!input.humanApproved||!input.humanApprovedBy?.trim()))throw new Error("COPILOT_HUMAN_APPROVAL_REQUIRED");
  if(next==="SIGNED_EXTERNALLY"&&!input.walletSignatureReference?.trim())throw new Error("COPILOT_EXTERNAL_WALLET_SIGNATURE_REQUIRED");
  if(next==="RECORDED"&&action.requiresWalletSignature&&action.state!=="SIGNED_EXTERNALLY")throw new Error("COPILOT_WALLET_SIGNATURE_REQUIRED_BEFORE_RECORDING");

  return{
    ...action,
    state:next,
    requiredPermission:next==="AWAITING_WALLET"||next==="SIGNED_EXTERNALLY"?"WALLET_SIGN":action.requiredPermission,
    ...(next==="APPROVED"?{humanApprovedAt:new Date().toISOString(),humanApprovedBy:input.humanApprovedBy!.trim()}:{}),
    ...(next==="REJECTED"&&input.rejectedBy?.trim()?{rejectedBy:input.rejectedBy.trim()}:{}),
    ...(input.walletSignatureReference?{walletSignatureReference:input.walletSignatureReference}:{}),
    updatedAt:new Date().toISOString(),
  };
}
