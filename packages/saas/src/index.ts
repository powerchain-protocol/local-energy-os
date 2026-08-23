export type SaaSAppId =
  | "energy"
  | "platform"
  | "companies"
  | "grid"
  | "plants"
  | "wind"
  | "ev"
  | "charging"
  | "mapper"
  | "supply-chain";

export interface SaaSPlan {
  id: string;
  name: string;
  applicationIds: SaaSAppId[];
  featureIds: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  state: "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED";
  startsAt: Date;
  endsAt?: Date;
}

export interface EntitlementContext {
  tenantId: string;
  organizationId: string;
  workspaceId?: string;
  participantType?: "PROSUMER" | "CONSUMER" | "CLIENT" | "GRID_OPERATOR";
  appId: SaaSAppId;
  featureId?: string;
}

export interface EntitlementDecision {
  allowed: boolean;
  reason: string;
  planId?: string;
  subscriptionId?: string;
}

export function resolveEntitlement(args: {
  context: EntitlementContext;
  plans: readonly SaaSPlan[];
  subscriptions: readonly Subscription[];
  now?: Date;
}): EntitlementDecision {
  const now = args.now ?? new Date();
  const subscription = args.subscriptions.find((item) =>
    item.tenantId === args.context.tenantId &&
    item.state === "ACTIVE" &&
    item.startsAt <= now &&
    (!item.endsAt || item.endsAt > now));
  if (!subscription) return { allowed: false, reason: "NO_ACTIVE_SUBSCRIPTION" };
  const plan = args.plans.find((item) => item.id === subscription.planId);
  if (!plan) return { allowed: false, reason: "PLAN_NOT_FOUND", subscriptionId: subscription.id };
  if (!plan.applicationIds.includes(args.context.appId)) {
    return { allowed: false, reason: "APP_NOT_ENTITLED", planId: plan.id, subscriptionId: subscription.id };
  }
  if (args.context.featureId && !plan.featureIds.includes(args.context.featureId)) {
    return { allowed: false, reason: "FEATURE_NOT_ENTITLED", planId: plan.id, subscriptionId: subscription.id };
  }
  return { allowed: true, reason: "ENTITLED", planId: plan.id, subscriptionId: subscription.id };
}
