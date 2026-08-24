import "server-only";
import { transitionCopilotAction, type CopilotActionDraft } from "@powerchain/copilot";
import { PostgresCopilotRepository } from "@powerchain/database/copilot";

const globalStore = globalThis as unknown as {
  powerChainCopilotActions?: Map<string,Map<string,CopilotActionDraft>>;
  powerChainCopilotRepository?: PostgresCopilotRepository;
};
globalStore.powerChainCopilotActions ??= new Map();
globalStore.powerChainCopilotRepository ??= new PostgresCopilotRepository();

function databaseConfigured(){
  return Boolean(process.env.DATABASE_URL?.trim());
}

function organizationActions(organizationId:string){
  const current=globalStore.powerChainCopilotActions!.get(organizationId);
  if(current)return current;
  const created=new Map<string,CopilotActionDraft>();
  globalStore.powerChainCopilotActions!.set(organizationId,created);
  return created;
}

export async function saveCopilotAction(organizationId:string,userId:string,action:CopilotActionDraft){
  if(databaseConfigured()){
    return globalStore.powerChainCopilotRepository!.save({organizationId,userId,action});
  }
  organizationActions(organizationId).set(action.id,action);
  return action;
}

export async function listCopilotActions(organizationId:string){
  if(databaseConfigured())return globalStore.powerChainCopilotRepository!.list(organizationId,100);
  return [...organizationActions(organizationId).values()]
    .sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))
    .slice(0,100);
}

export async function getCopilotAction(organizationId:string,id:string){
  if(databaseConfigured())return globalStore.powerChainCopilotRepository!.get(organizationId,id);
  return organizationActions(organizationId).get(id) ?? null;
}

export async function approveCopilotAction(organizationId:string,userId:string,id:string){
  const current=await getCopilotAction(organizationId,id);
  if(!current)throw Object.assign(new Error("Copilot action not found"),{code:"COPILOT_ACTION_NOT_FOUND"});
  if(current.state==="AWAITING_WALLET"||current.state==="RECORDED")return current;
  const approved=transitionCopilotAction(current,"APPROVED",{humanApproved:true,humanApprovedBy:userId});
  const next=approved.requiresWalletSignature
    ? transitionCopilotAction(approved,"AWAITING_WALLET")
    : transitionCopilotAction(approved,"RECORDED");
  if(databaseConfigured()){
    return globalStore.powerChainCopilotRepository!.transition({
      organizationId,
      id,
      expectedState:"REVIEW_REQUIRED",
      action:next,
    });
  }
  return saveCopilotAction(organizationId,userId,next);
}

export async function rejectCopilotAction(organizationId:string,userId:string,id:string){
  const current=await getCopilotAction(organizationId,id);
  if(!current)throw Object.assign(new Error("Copilot action not found"),{code:"COPILOT_ACTION_NOT_FOUND"});
  if(current.state==="REJECTED")return current;
  const next=transitionCopilotAction(current,"REJECTED",{rejectedBy:userId});
  if(databaseConfigured()){
    return globalStore.powerChainCopilotRepository!.transition({
      organizationId,
      id,
      expectedState:"REVIEW_REQUIRED",
      action:next,
    });
  }
  return saveCopilotAction(organizationId,userId,next);
}


export async function recordCopilotWalletSignature(
  organizationId:string,
  userId:string,
  id:string,
  walletSignatureReference:string,
){
  const current=await getCopilotAction(organizationId,id);
  if(!current)throw Object.assign(new Error("Copilot action not found"),{code:"COPILOT_ACTION_NOT_FOUND"});
  if(current.state==="RECORDED"&&current.walletSignatureReference===walletSignatureReference)return current;
  if(current.state!=="AWAITING_WALLET"){
    throw Object.assign(new Error(`Copilot action is ${current.state}; external wallet signature can only be recorded from AWAITING_WALLET`),{code:"COPILOT_WALLET_STATE_INVALID"});
  }
  const signed=transitionCopilotAction(current,"SIGNED_EXTERNALLY",{walletSignatureReference});
  const next=transitionCopilotAction(signed,"RECORDED");
  if(databaseConfigured()){
    return globalStore.powerChainCopilotRepository!.transition({
      organizationId,
      id,
      expectedState:"AWAITING_WALLET",
      action:next,
    });
  }
  return saveCopilotAction(organizationId,userId,next);
}
