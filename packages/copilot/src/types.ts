export const COPILOT_VERSION = "1.0.0" as const;

export type CopilotMode = "ASK" | "ANALYZE" | "RESEARCH" | "ACT";
export type CopilotContextType =
  | "WORKSPACE"
  | "ASSET"
  | "PROJECT"
  | "PORTFOLIO"
  | "FUNDING_ROUND"
  | "TREASURY"
  | "DOCUMENT"
  | "TRANSACTION"
  | "REPORT"
  | "ENERGY_RWA"
  | "DIGITAL_TWIN"
  | "LOCAL_ENERGY";

export interface CopilotContextRef {
  type: CopilotContextType;
  id: string;
  label: string;
  source?: "ROUTE" | "USER" | "COMPANY_OS" | "RENEWABLE_RWA";
}

export type CopilotPermission =
  | "READ"
  | "ANALYZE"
  | "DRAFT"
  | "RECOMMEND"
  | "REQUEST_APPROVAL"
  | "HUMAN_APPROVE"
  | "WALLET_SIGN";

export type CopilotAgentId =
  | "asset-researcher"
  | "asset-analyst"
  | "risk-agent"
  | "capital-agent"
  | "operator-agent"
  | "verification-agent"
  | "document-intelligence-agent"
  | "reporting-agent"
  | "impact-agent"
  | "launch-agent";

export type CopilotSkillId =
  | "asset-analysis"
  | "forecast-analysis"
  | "anomaly-detection"
  | "market-research"
  | "document-analysis"
  | "rwa-verification"
  | "treasury-analysis"
  | "funding-analysis"
  | "report-generation"
  | "workflow-planning"
  | "impact-calculation";

export interface CopilotSkillDefinition {
  id: CopilotSkillId;
  name: string;
  category: "ASSETS" | "CAPITAL" | "RISK" | "OPERATIONS" | "DOCUMENTS" | "IMPACT";
  description: string;
  permissions: CopilotPermission[];
  output: string;
}

export interface CopilotAgentDefinition {
  id: CopilotAgentId;
  name: string;
  purpose: string;
  skills: CopilotSkillId[];
  permissions: CopilotPermission[];
  outputContract: string[];
}

export interface CopilotPromptDefinition {
  id: string;
  category: "ASSETS" | "CAPITAL" | "RISK" | "OPERATIONS";
  title: string;
  prompt: string;
  mode: CopilotMode;
  contexts: CopilotContextType[];
}

export interface CopilotPlanStep {
  id: string;
  order: number;
  agentId: CopilotAgentId;
  agentName: string;
  purpose: string;
  skills: CopilotSkillId[];
  status: "PLANNED" | "RUNNING" | "COMPLETED" | "BLOCKED";
}

export interface CopilotExecutionPlan {
  id: string;
  version: typeof COPILOT_VERSION;
  mode: CopilotMode;
  request: string;
  contexts: CopilotContextRef[];
  steps: CopilotPlanStep[];
  requiresHumanApproval: boolean;
  requiresWalletSignature: boolean;
  safeguards: readonly [
    "NO_SILENT_FUND_MOVEMENT",
    "NO_SILENT_CRITICAL_RECORD_CHANGE",
    "NO_AGENT_WALLET_SIGNATURE",
    "EXPLICIT_HUMAN_APPROVAL_FOR_HIGH_IMPACT_ACTIONS"
  ];
}

export type CopilotActionState =
  | "DRAFT"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "AWAITING_WALLET"
  | "SIGNED_EXTERNALLY"
  | "RECORDED"
  | "REJECTED";

export interface CopilotActionDraft {
  id: string;
  title: string;
  description: string;
  state: CopilotActionState;
  createdBy: CopilotAgentId;
  contexts: CopilotContextRef[];
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredPermission: CopilotPermission;
  requiresWalletSignature: boolean;
  humanApprovedAt?: string;
  humanApprovedBy?: string;
  rejectedBy?: string;
  walletSignatureReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyOsContext {
  brand?: Record<string, unknown>;
  products?: string[];
  businessRules?: string[];
  policies?: string[];
  organization?: { id: string; name?: string };
  operatingPrinciples?: string[];
}

export interface RenewableRwaContext {
  assets?: CopilotContextRef[];
  projects?: CopilotContextRef[];
  fundingRounds?: CopilotContextRef[];
  documents?: CopilotContextRef[];
  treasury?: CopilotContextRef[];
  energyData?: CopilotContextRef[];
  riskRules?: string[];
}
