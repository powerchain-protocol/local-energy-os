export interface RewardContribution { participantId: string; verifiedRenewableWh: bigint; localDeliveryWh: bigint; flexibilityWh: bigint; qualityBps: bigint; reliabilityBps: bigint }
export function contributionScore(c: RewardContribution): bigint {
  if (c.qualityBps < 0n || c.qualityBps > 10_000n || c.reliabilityBps < 0n || c.reliabilityBps > 10_000n) throw new Error("INVALID_REWARD_MULTIPLIER");
  const physical = c.verifiedRenewableWh + c.localDeliveryWh * 2n + c.flexibilityWh * 3n;
  return physical * c.qualityBps * c.reliabilityBps / 100_000_000n;
}
export function allocateEpoch(poolBaseUnits: bigint, contributions: readonly RewardContribution[]) {
  const scored = contributions.map(c=>({participantId:c.participantId,score:contributionScore(c)}));
  const total = scored.reduce((sum,item)=>sum+item.score,0n);
  return scored.map(item=>({participantId:item.participantId,score:item.score,allocationBaseUnits:total===0n?0n:poolBaseUnits*item.score/total}));
}
