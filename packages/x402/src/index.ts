export interface SpendPolicy { allowedPayees: readonly string[]; allowedAssets: readonly string[]; maxPerCallBaseUnits: bigint; maxDailyBaseUnits: bigint }
export function assertSpend(policy: SpendPolicy, request: {payee:string; asset:string; amountBaseUnits:bigint; spentTodayBaseUnits:bigint}) {
  if (!policy.allowedPayees.includes(request.payee)) throw new Error("X402_PAYEE_NOT_ALLOWED");
  if (!policy.allowedAssets.includes(request.asset)) throw new Error("X402_ASSET_NOT_ALLOWED");
  if (request.amountBaseUnits > policy.maxPerCallBaseUnits) throw new Error("X402_PER_CALL_LIMIT");
  if (request.spentTodayBaseUnits + request.amountBaseUnits > policy.maxDailyBaseUnits) throw new Error("X402_DAILY_LIMIT");
}
