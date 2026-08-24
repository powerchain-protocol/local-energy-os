import { randomBase64Url, secureRandomId, sha256Hex } from "@powerchain/crypto-utils";

export type SaaSAppId = "energy" | "platform" | "companies" | "grid" | "plants" | "wind" | "ev" | "charging" | "mapper" | "supply-chain";
export type CanonicalPlanId = "COMMUNITY" | "PRO" | "GRID_OPERATOR" | "ENTERPRISE";

export interface SaaSPlan {
  id: string;
  name: string;
  applicationIds: SaaSAppId[];
  featureIds: string[];
  quotas?: Record<string, number>;
}
export interface SaaSTenant { id:string; organizationId:string; name:string; planId:CanonicalPlanId; state:"ACTIVE"|"SUSPENDED"|"CANCELLED"; createdAt:Date; }
export interface TenantMember { tenantId:string; actorId:string; role:string; participantType?:"PROSUMER"|"CONSUMER"|"CLIENT"|"GRID_OPERATOR"; createdAt:Date; }
export interface Subscription { id:string; tenantId:string; planId:string; state:"TRIAL"|"ACTIVE"|"PAST_DUE"|"SUSPENDED"|"CANCELLED"; startsAt:Date; endsAt?:Date; }
export interface EntitlementOverride { tenantId:string; appId:SaaSAppId; featureId?:string; allowed:boolean; }
export interface EntitlementContext { tenantId:string; organizationId:string; workspaceId?:string; participantType?:"PROSUMER"|"CONSUMER"|"CLIENT"|"GRID_OPERATOR"; appId:SaaSAppId; featureId?:string; }
export interface EntitlementDecision { allowed:boolean; reason:string; planId?:string; subscriptionId?:string; }
export interface TenantUsage { tenantId:string; metric:string; period:string; used:number; limit?:number; updatedAt:Date; }
export interface TenantApiKey { id:string; tenantId:string; name:string; keyPrefix:string; secretHash:string; scopes:string[]; createdAt:Date; revokedAt?:Date; lastUsedAt?:Date; }
export interface AuditEvent { id:string; tenantId?:string; actorId?:string; action:string; resourceType:string; resourceId?:string; requestId?:string; metadata?:Record<string,unknown>; createdAt:Date; }

export const CANONICAL_PLANS: readonly SaaSPlan[] = [
  { id:"COMMUNITY", name:"Community", applicationIds:["energy","grid","mapper"], featureIds:["p2p-market","energy-rwa","community","rewards"], quotas:{apiRequestsPerMonth:100_000, energyRwaPositions:10_000} },
  { id:"PRO", name:"Pro", applicationIds:["energy","platform","companies","grid","plants","wind","ev","charging","mapper"], featureIds:["p2p-market","energy-rwa","rewards","oracles","market-data","api-keys"], quotas:{apiRequestsPerMonth:1_000_000, energyRwaPositions:100_000} },
  { id:"GRID_OPERATOR", name:"Grid Operator", applicationIds:["energy","platform","companies","grid","plants","wind","ev","charging","mapper"], featureIds:["grid-digital-twin","flexibility","vpp","energy-rwa","oracles","system-health","api-keys"], quotas:{apiRequestsPerMonth:5_000_000, energyRwaPositions:1_000_000} },
  { id:"ENTERPRISE", name:"Enterprise", applicationIds:["energy","platform","companies","grid","plants","wind","ev","charging","mapper","supply-chain"], featureIds:["*"], quotas:{apiRequestsPerMonth:50_000_000, energyRwaPositions:10_000_000} },
] as const;

export function resolveEntitlement(args:{context:EntitlementContext; plans:readonly SaaSPlan[]; subscriptions:readonly Subscription[]; overrides?:readonly EntitlementOverride[]; now?:Date}):EntitlementDecision {
  const override = args.overrides?.find((o) => o.tenantId===args.context.tenantId && o.appId===args.context.appId && (o.featureId===undefined || o.featureId===args.context.featureId));
  if (override) return {allowed:override.allowed, reason:override.allowed?"OVERRIDE_ALLOW":"OVERRIDE_DENY"};
  const now=args.now??new Date();
  const subscription=args.subscriptions.find((item)=>item.tenantId===args.context.tenantId && item.state==="ACTIVE" && item.startsAt<=now && (!item.endsAt||item.endsAt>now));
  if(!subscription)return{allowed:false,reason:"NO_ACTIVE_SUBSCRIPTION"};
  const plan=args.plans.find((item)=>item.id===subscription.planId);
  if(!plan)return{allowed:false,reason:"PLAN_NOT_FOUND",subscriptionId:subscription.id};
  if(!plan.applicationIds.includes(args.context.appId))return{allowed:false,reason:"APP_NOT_ENTITLED",planId:plan.id,subscriptionId:subscription.id};
  if(args.context.featureId && !plan.featureIds.includes("*") && !plan.featureIds.includes(args.context.featureId))return{allowed:false,reason:"FEATURE_NOT_ENTITLED",planId:plan.id,subscriptionId:subscription.id};
  return{allowed:true,reason:"ENTITLED",planId:plan.id,subscriptionId:subscription.id};
}

export function generateTenantApiKey(args:{tenantId:string;name:string;scopes:string[]}):{record:TenantApiKey;secret:string}{
  const id=secureRandomId("key"); const raw=randomBase64Url(32); const prefix=`pc_${raw.slice(0,8)}`; const secret=`${prefix}.${raw}`;
  return { secret, record:{id,tenantId:args.tenantId,name:args.name,keyPrefix:prefix,secretHash:sha256Hex(secret),scopes:[...new Set(args.scopes)].sort(),createdAt:new Date()} };
}
export function verifyTenantApiKey(secret:string, record:TenantApiKey):boolean { return !record.revokedAt && sha256Hex(secret)===record.secretHash; }
