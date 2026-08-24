import { COPILOT_AGENTS } from "../agents";
import { normalizeContexts } from "../context";
import type {
  CopilotAgentId,
  CopilotContextRef,
  CopilotExecutionPlan,
  CopilotMode,
  CopilotSkillId,
} from "../types";

const AGENT = new Map(COPILOT_AGENTS.map(agent => [agent.id, agent]));

function agent(id: CopilotAgentId) {
  const value = AGENT.get(id);
  if (!value) throw new Error(`COPILOT_AGENT_NOT_FOUND:${id}`);
  return value;
}

function chooseAgents(mode: CopilotMode, request: string): CopilotAgentId[] {
  const q = request.toLowerCase();
  const ids: CopilotAgentId[] = [];

  if (/research|opportunit|market|policy|regulat|technology|region|competitor/.test(q) || mode === "RESEARCH") ids.push("asset-researcher");
  if (/production|forecast|performance|capacity|efficien|asset|generation|telemetry/.test(q) || mode === "ANALYZE") ids.push("asset-analyst");
  if (/risk|anomal|exposure|missing|conflict|verify|backing|provenance/.test(q)) ids.push("risk-agent");
  if (/fund|capital|treasury|settlement|distribution|revenue|allocation/.test(q)) ids.push("capital-agent");
  if (/document|due diligence|agreement|contract|term/.test(q)) ids.push("document-intelligence-agent");
  if (/impact|environment|emission|mwh|energy generated/.test(q)) ids.push("impact-agent");
  if (/launch|participation|readiness/.test(q)) ids.push("launch-agent");
  if (/report|summary|weekly|monthly/.test(q)) ids.push("reporting-agent");
  if (/task|workflow|sop|milestone|action|prepare|create|update/.test(q) || mode === "ACT") ids.push("operator-agent");
  if (/verify|document|chain|solana|sui|rwa/.test(q)) ids.push("verification-agent");

  if (!ids.length) ids.push(mode === "ASK" ? "asset-analyst" : "risk-agent");
  if (mode === "ACT" && !ids.includes("operator-agent")) ids.push("operator-agent");

  return [...new Set(ids)].slice(0, 5);
}

export function planCopilotRequest(input: {
  request: string;
  mode: CopilotMode;
  contexts?: readonly CopilotContextRef[];
}): CopilotExecutionPlan {
  const request = input.request.trim();
  if (!request) throw new Error("COPILOT_REQUEST_REQUIRED");
  if (request.length > 2_000) throw new Error("COPILOT_REQUEST_TOO_LONG");

  const contexts = normalizeContexts(input.contexts);
  const selected = chooseAgents(input.mode, request);
  const requiresHumanApproval = input.mode === "ACT";
  const requiresWalletSignature =
    input.mode === "ACT" &&
    /wallet|transfer|fund|settle|distribution|treasury|transaction|on-chain|onchain|solana|sui/.test(request.toLowerCase());

  return {
    id: `coplan_${crypto.randomUUID().replaceAll("-","")}`,
    version: "1.0.0",
    mode: input.mode,
    request,
    contexts,
    steps: selected.map((id, index) => {
      const definition = agent(id);
      return {
        id: `step_${index + 1}`,
        order: index + 1,
        agentId: id,
        agentName: definition.name,
        purpose: definition.purpose,
        skills: [...definition.skills] as CopilotSkillId[],
        status: "PLANNED" as const,
      };
    }),
    requiresHumanApproval,
    requiresWalletSignature,
    safeguards: [
      "NO_SILENT_FUND_MOVEMENT",
      "NO_SILENT_CRITICAL_RECORD_CHANGE",
      "NO_AGENT_WALLET_SIGNATURE",
      "EXPLICIT_HUMAN_APPROVAL_FOR_HIGH_IMPACT_ACTIONS",
    ],
  };
}
