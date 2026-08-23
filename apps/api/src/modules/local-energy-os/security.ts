import { SlidingWindowRateLimiter, RATE_LIMITS, type RateLimitRule } from "@powerchain/rate-limit";
import { executeSafeAction, InMemoryIdempotencyStore, type ActionRisk } from "@powerchain/safe-actions";
import { resolveRequestContext } from "./context.js";

export const apiRateLimiter = new SlidingWindowRateLimiter();
export const actionIdempotency = new InMemoryIdempotencyStore();

export function enforceRateLimit(request: any, rule: RateLimitRule = RATE_LIMITS.tenantRead) {
  const context = resolveRequestContext(request);
  const key = context.tenantId ?? request?.ip ?? request?.headers?.["x-forwarded-for"] ?? "anonymous";
  const decision = apiRateLimiter.check(String(key), rule);
  if (!decision.allowed) {
    const error = new Error("RATE_LIMITED") as Error & { retryAfterMs?: number };
    error.retryAfterMs = decision.retryAfterMs;
    throw error;
  }
  return decision;
}

export async function safeMutation<T>(request:any,args:{action:string;risk:ActionRisk;scope?:string;amountBaseUnits?:bigint;maxAmountBaseUnits?:bigint},fn:()=>Promise<T>|T){
  const context=resolveRequestContext(request);
  enforceRateLimit(request, args.risk==="BRIDGE"||args.risk==="CHAIN_WRITE"?RATE_LIMITS.sensitiveMutation:RATE_LIMITS.mutation);
  const idempotencyKey=String(request?.headers?.["idempotency-key"]??request?.headers?.["x-idempotency-key"]??"").trim()||undefined;
  return executeSafeAction({action:args.action,risk:args.risk,tenantId:context.tenantId,actorId:request?.user?.id,idempotencyKey,scopes:request?.user?.scopes??[],requiresScope:args.scope,amountBaseUnits:args.amountBaseUnits,maxAmountBaseUnits:args.maxAmountBaseUnits},fn,actionIdempotency);
}
