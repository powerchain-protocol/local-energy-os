export interface AgentSpendPolicy {
  allowedPayees: string[];
  allowedAssets: string[];
  allowedNetworks: Array<"SOLANA" | "SUI">;
  allowedServices: string[];
  maxPaymentBaseUnits: bigint;
  dailyLimitBaseUnits: bigint;
  requireSimulation: boolean;
  requireHumanApprovalAbove?: bigint;
}
export interface AgentPaymentIntent {
  payee: string;
  asset: string;
  network: "SOLANA" | "SUI";
  service: string;
  amountBaseUnits: bigint;
}
export function authorizeAgentPayment(intent: AgentPaymentIntent, policy: AgentSpendPolicy, spentToday: bigint) {
  if (!policy.allowedPayees.includes(intent.payee)) throw new Error("PAYEE_NOT_ALLOWED");
  if (!policy.allowedAssets.includes(intent.asset)) throw new Error("ASSET_NOT_ALLOWED");
  if (!policy.allowedNetworks.includes(intent.network)) throw new Error("NETWORK_NOT_ALLOWED");
  if (!policy.allowedServices.includes(intent.service)) throw new Error("SERVICE_NOT_ALLOWED");
  if (intent.amountBaseUnits > policy.maxPaymentBaseUnits) throw new Error("PAYMENT_LIMIT_EXCEEDED");
  if (spentToday + intent.amountBaseUnits > policy.dailyLimitBaseUnits) throw new Error("DAILY_LIMIT_EXCEEDED");
  return { allowed: true, requiresHumanApproval: policy.requireHumanApprovalAbove !== undefined && intent.amountBaseUnits > policy.requireHumanApprovalAbove };
}
