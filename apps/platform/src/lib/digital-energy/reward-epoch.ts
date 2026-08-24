import "server-only";
import type { DigitalEnergySummary } from "@powerchain/digital-energy";

export type DigitalEnergyRewardEpochState = "UNCONFIGURED" | "SCHEDULED" | "ACTIVE" | "CLOSED" | "INVALID";

export function getDigitalEnergyRewardEpoch(summary:DigitalEnergySummary){
  const id=process.env.POWERCHAIN_REWARD_EPOCH_ID?.trim();
  const startRaw=process.env.POWERCHAIN_REWARD_EPOCH_START?.trim();
  const endRaw=process.env.POWERCHAIN_REWARD_EPOCH_END?.trim();
  if(!id||!startRaw||!endRaw)return{
    state:"UNCONFIGURED" as const,
    epochId:id??null,
    startAt:startRaw??null,
    endAt:endRaw??null,
    eligibleVerifiedWh:summary.verifiedWh,
    rewardAsset:"PWRC" as const,
    settlementNetwork:"SOLANA" as const,
    conversionPolicy:"EXPLICIT_POLICY_REQUIRED" as const,
    rewardAmount:null,
  };
  const start=new Date(startRaw),end=new Date(endRaw);
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<=start)return{state:"INVALID" as const,epochId:id,startAt:startRaw,endAt:endRaw,eligibleVerifiedWh:summary.verifiedWh,rewardAsset:"PWRC" as const,settlementNetwork:"SOLANA" as const,conversionPolicy:"EXPLICIT_POLICY_REQUIRED" as const,rewardAmount:null};
  const now=Date.now();
  const state:DigitalEnergyRewardEpochState=now<start.getTime()?"SCHEDULED":now>=end.getTime()?"CLOSED":"ACTIVE";
  return{state,epochId:id,startAt:start.toISOString(),endAt:end.toISOString(),eligibleVerifiedWh:summary.verifiedWh,rewardAsset:"PWRC" as const,settlementNetwork:"SOLANA" as const,conversionPolicy:"EXPLICIT_POLICY_REQUIRED" as const,rewardAmount:null};
}
