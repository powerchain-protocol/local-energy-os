import { sha256Hex } from "@powerchain/crypto-utils";

export type RewardEpochState = "DRAFT" | "COLLECTING" | "FINALIZING" | "FINALIZED" | "CLAIMABLE" | "CLOSED";
export interface RewardContribution {
  id: string;
  epochId: string;
  tenantId: string;
  participantId: string;
  category: "RENEWABLE_GENERATION" | "LOCAL_DELIVERY" | "GRID_FLEXIBILITY" | "DEPIN_UPTIME" | "TELEMETRY" | "EV_FLEXIBILITY" | "BATTERY_DISPATCH" | "RELIABILITY";
  verifiedWh?: bigint;
  qualityScorePpm: bigint;
  reliabilityScorePpm: bigint;
  weightPpm: bigint;
}
export interface RewardEpoch {
  id: string;
  startsAt: Date;
  endsAt: Date;
  state: RewardEpochState;
  rewardPoolPwrcBaseUnits: bigint;
  contributionRoot?: string;
  allocationRoot?: string;
}
export interface RewardAllocation { epochId: string; participantId: string; pwrcBaseUnits: bigint; score: bigint; }

export function contributionScore(c: RewardContribution): bigint {
  const base = c.verifiedWh ?? 1_000n;
  return (((base * c.qualityScorePpm) / 1_000_000n) * c.reliabilityScorePpm / 1_000_000n) * c.weightPpm / 1_000_000n;
}

export function allocateEpoch(epoch: RewardEpoch, contributions: readonly RewardContribution[]): RewardAllocation[] {
  if (epoch.state !== "FINALIZING" && epoch.state !== "FINALIZED") throw new Error("EPOCH_NOT_FINALIZABLE");
  const scores = contributions.map((c) => ({ c, score: contributionScore(c) }));
  const total = scores.reduce((sum, item) => sum + item.score, 0n);
  if (total <= 0n) return [];
  return scores.map(({c, score}) => ({
    epochId: epoch.id,
    participantId: c.participantId,
    score,
    pwrcBaseUnits: (epoch.rewardPoolPwrcBaseUnits * score) / total,
  }));
}

export function deterministicAllocationRoot(allocations: readonly RewardAllocation[]): string {
  const body = [...allocations]
    .sort((a,b) => a.participantId.localeCompare(b.participantId))
    .map((a) => `${a.epochId}:${a.participantId}:${a.pwrcBaseUnits}:${a.score}`)
    .join("\n");
  return sha256Hex(body);
}
