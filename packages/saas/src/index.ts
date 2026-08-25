export type PlanId = "STARTER" | "PRO" | "BUSINESS" | "ENTERPRISE" | "GRID";
export type AppId = "ENERGY" | "PLATFORM" | "COMPANIES" | "GRID" | "PLANTS" | "WIND" | "CHARGING" | "SUPPLY_CHAIN" | "API";

export const planCatalog = Object.freeze(["STARTER", "PRO", "BUSINESS", "ENTERPRISE", "GRID"] as const);
export const appCatalog = Object.freeze(["ENERGY", "PLATFORM", "COMPANIES", "GRID", "PLANTS", "WIND", "CHARGING", "SUPPLY_CHAIN", "API"] as const);

const PLAN_APPS: Record<PlanId, readonly AppId[]> = {
  STARTER: ["ENERGY"],
  PRO: ["ENERGY", "CHARGING"],
  BUSINESS: ["ENERGY", "COMPANIES", "CHARGING", "SUPPLY_CHAIN", "API"],
  ENTERPRISE: ["ENERGY", "COMPANIES", "GRID", "PLANTS", "WIND", "CHARGING", "SUPPLY_CHAIN", "API"],
  GRID: ["GRID", "ENERGY", "API", "COMPANIES"]
};

export interface EntitlementRequest { plan: PlanId; app: AppId; feature?: string; overrides?: Record<string, boolean> }
export interface EntitlementDecision { allowed: boolean; reason: "PLAN" | "OVERRIDE_ALLOW" | "OVERRIDE_DENY" | "NOT_INCLUDED" }
export function isPlanId(value: unknown): value is PlanId { return typeof value === "string" && (planCatalog as readonly string[]).includes(value); }
export function isAppId(value: unknown): value is AppId { return typeof value === "string" && (appCatalog as readonly string[]).includes(value); }
export function resolveEntitlement(r: EntitlementRequest): EntitlementDecision {
  if (!isPlanId(r.plan) || !isAppId(r.app)) return { allowed: false, reason: "NOT_INCLUDED" };
  if (r.feature && r.overrides?.[r.feature] === false) return { allowed: false, reason: "OVERRIDE_DENY" };
  if (r.feature && r.overrides?.[r.feature] === true) return { allowed: true, reason: "OVERRIDE_ALLOW" };
  return PLAN_APPS[r.plan].includes(r.app) ? { allowed: true, reason: "PLAN" } : { allowed: false, reason: "NOT_INCLUDED" };
}
export function appsForPlan(plan: PlanId): readonly AppId[] { return PLAN_APPS[plan]; }
