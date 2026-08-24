import "server-only";
import type { QueryResultRow } from "pg";
import { getPostgresPool } from "../clients/postgres";
import type {
  CopilotActionDraft,
  CopilotActionState,
  CopilotAgentId,
  CopilotContextRef,
} from "@powerchain/copilot";

interface CopilotActionRow extends QueryResultRow {
  id:string;
  organization_id:string;
  created_by_user_id:string;
  created_by_agent:CopilotAgentId;
  title:string;
  description:string;
  state:CopilotActionState;
  risk:CopilotActionDraft["risk"];
  required_permission:CopilotActionDraft["requiredPermission"];
  requires_wallet_signature:boolean;
  contexts:CopilotContextRef[];
  human_approved_at:Date|null;
  human_approved_by:string|null;
  rejected_by:string|null;
  wallet_signature_reference:string|null;
  created_at:Date;
  updated_at:Date;
}

function record(row:CopilotActionRow):CopilotActionDraft{
  return{
    id:row.id,
    title:row.title,
    description:row.description,
    state:row.state,
    createdBy:row.created_by_agent,
    contexts:Array.isArray(row.contexts)?row.contexts:[],
    risk:row.risk,
    requiredPermission:row.required_permission,
    requiresWalletSignature:Boolean(row.requires_wallet_signature),
    ...(row.human_approved_at?{humanApprovedAt:new Date(row.human_approved_at).toISOString()}:{}),
    ...(row.human_approved_by?{humanApprovedBy:row.human_approved_by}:{}),
    ...(row.rejected_by?{rejectedBy:row.rejected_by}:{}),
    ...(row.wallet_signature_reference?{walletSignatureReference:row.wallet_signature_reference}:{}),
    createdAt:new Date(row.created_at).toISOString(),
    updatedAt:new Date(row.updated_at).toISOString(),
  };
}

export class PostgresCopilotRepository{
  async save(input:{organizationId:string;userId:string;action:CopilotActionDraft}){
    const a=input.action;
    const result=await getPostgresPool().query<CopilotActionRow>(`
      insert into copilot_actions
      (id,organization_id,created_by_user_id,created_by_agent,title,description,state,risk,required_permission,requires_wallet_signature,contexts,human_approved_at,human_approved_by,rejected_by,wallet_signature_reference,created_at,updated_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,$16,$17)
      on conflict (id) do update set
        state=excluded.state,
        risk=excluded.risk,
        required_permission=excluded.required_permission,
        requires_wallet_signature=excluded.requires_wallet_signature,
        contexts=excluded.contexts,
        human_approved_at=excluded.human_approved_at,
        human_approved_by=excluded.human_approved_by,
        rejected_by=excluded.rejected_by,
        wallet_signature_reference=excluded.wallet_signature_reference,
        updated_at=excluded.updated_at
      where copilot_actions.organization_id=excluded.organization_id
      returning *
    `,[
      a.id,input.organizationId,input.userId,a.createdBy,a.title,a.description,a.state,a.risk,a.requiredPermission,
      a.requiresWalletSignature,
      JSON.stringify(a.contexts),
      a.humanApprovedAt?new Date(a.humanApprovedAt):null,
      a.humanApprovedBy??null,
      a.rejectedBy??null,
      a.walletSignatureReference??null,
      new Date(a.createdAt),
      new Date(a.updatedAt),
    ]);
    if(!result.rows[0])throw Object.assign(new Error("Copilot action belongs to another organization"),{code:"COPILOT_ACTION_ORGANIZATION_MISMATCH"});
    return record(result.rows[0]);
  }


  async transition(input:{
    organizationId:string;
    id:string;
    expectedState:CopilotActionState;
    action:CopilotActionDraft;
  }){
    const a=input.action;
    const result=await getPostgresPool().query<CopilotActionRow>(`
      update copilot_actions
      set state=$3,
          risk=$4,
          required_permission=$5,
          requires_wallet_signature=$6,
          contexts=$7::jsonb,
          human_approved_at=$8,
          human_approved_by=$9,
          rejected_by=$10,
          wallet_signature_reference=$11,
          updated_at=$12
      where organization_id=$1 and id=$2 and state=$13
      returning *
    `,[
      input.organizationId,
      input.id,
      a.state,
      a.risk,
      a.requiredPermission,
      a.requiresWalletSignature,
      JSON.stringify(a.contexts),
      a.humanApprovedAt?new Date(a.humanApprovedAt):null,
      a.humanApprovedBy??null,
      a.rejectedBy??null,
      a.walletSignatureReference??null,
      new Date(a.updatedAt),
      input.expectedState,
    ]);
    if(result.rows[0])return record(result.rows[0]);
    const current=await this.get(input.organizationId,input.id);
    if(!current)throw Object.assign(new Error("Copilot action not found"),{code:"COPILOT_ACTION_NOT_FOUND"});
    if(current.state!==a.state)throw Object.assign(new Error(`Copilot action decision conflict: current state is ${current.state}`),{code:"COPILOT_ACTION_DECISION_CONFLICT"});
    return current;
  }

  async list(organizationId:string,limit=100){
    const result=await getPostgresPool().query<CopilotActionRow>(`
      select * from copilot_actions
      where organization_id=$1
      order by updated_at desc
      limit $2
    `,[organizationId,Math.max(1,Math.min(limit,500))]);
    return result.rows.map(record);
  }

  async get(organizationId:string,id:string){
    const result=await getPostgresPool().query<CopilotActionRow>(`
      select * from copilot_actions where organization_id=$1 and id=$2
    `,[organizationId,id]);
    return result.rows[0]?record(result.rows[0]):null;
  }
}
