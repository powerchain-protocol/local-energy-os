import type { DigitalEnergyApiEnvelope, DigitalEnergyOverviewPayload, DigitalEnergyPositionBackingPayload } from "./types";
export async function fetchDigitalEnergyOverview(signal?:AbortSignal){
  const response=await fetch("/api/v1/digital-energy/overview",{cache:"no-store",signal});
  const payload=await response.json() as DigitalEnergyApiEnvelope<DigitalEnergyOverviewPayload>|{error?:{message?:string}};
  if(!response.ok||!("data" in payload))throw new Error("error" in payload?payload.error?.message??"Digital Energy API unavailable":"Digital Energy API unavailable");
  return payload;
}
export function wh(value:string|bigint){
  const v=typeof value==="bigint"?value:BigInt(value||"0");
  if(v>=1_000_000_000n)return`${compact(v,1_000_000_000n)} GWh`;
  if(v>=1_000_000n)return`${compact(v,1_000_000n)} MWh`;
  if(v>=1_000n)return`${compact(v,1_000n)} kWh`;
  return`${v} Wh`;
}
function compact(value:bigint,unit:bigint){const whole=value/unit;const remainder=value%unit;if(!remainder)return whole.toString();const thousandths=(remainder*1000n/unit).toString().padStart(3,"0").replace(/0+$/g,"");return`${whole}.${thousandths}`}
export function ppm(value:string|bigint){return`${(Number(value)/10_000).toFixed(1)}%`}
export function short(value:string){return value.length>24?`${value.slice(0,10)}…${value.slice(-8)}`:value}
export function explorerUrl(network:"SOLANA"|"SUI",reference:string){const ref=encodeURIComponent(reference);return network==="SOLANA"?`https://solscan.io/token/${ref}`:`https://suiscan.xyz/mainnet/object/${ref}/tx-blocks`}

export async function fetchDigitalEnergyPositionBacking(positionId:string,signal?:AbortSignal){
  const response=await fetch(`/api/v1/digital-energy/positions/${encodeURIComponent(positionId)}/backing`,{cache:"no-store",signal});
  const payload=await response.json() as DigitalEnergyApiEnvelope<DigitalEnergyPositionBackingPayload>|{error?:{message?:string}};
  if(!response.ok||!("data" in payload))throw new Error("error" in payload?payload.error?.message??"Energy backing unavailable":"Energy backing unavailable");
  return payload;
}
