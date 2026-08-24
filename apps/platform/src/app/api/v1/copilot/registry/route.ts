import { NextResponse } from "next/server";
import { COPILOT_AGENTS, COPILOT_PROMPTS, COPILOT_SKILLS, COPILOT_VERSION } from "@powerchain/copilot";

export async function GET(){
  return NextResponse.json({
    data:{
      product:"PowerChain Copilot",
      version:COPILOT_VERSION,
      positioning:"Renewable RWA operating intelligence",
      modes:[
        {id:"ASK",outcome:"Answer"},
        {id:"ANALYZE",outcome:"Evidence + insight"},
        {id:"RESEARCH",outcome:"Sources + findings"},
        {id:"ACT",outcome:"Draft action for approval"},
      ],
      agents:COPILOT_AGENTS,
      skills:COPILOT_SKILLS,
      prompts:COPILOT_PROMPTS,
      approvalChain:["READ","ANALYZE","DRAFT","RECOMMEND","REQUEST_APPROVAL","HUMAN_APPROVE","WALLET_SIGN"],
      contextHierarchy:{
        companyOs:["Brand","Products","Business Rules","Policies","Organization","Operating Principles"],
        renewableRwa:["Assets","Projects","Funding Rounds","Documents","Treasury","Energy Data","Local Energy","Risk Rules"],
        agentContext:"Minimum context required for the selected agent step",
      },
      principles:{
        copilotIsInterface:true,
        agentsAreWorkforce:true,
        skillsAreCapabilities:true,
        orchestratorCoordinates:true,
        aiCannotSignTransactions:true,
        humanApprovalRequiredForHighImpactActions:true,
      },
    },
  },{headers:{"Cache-Control":"no-store"}});
}
