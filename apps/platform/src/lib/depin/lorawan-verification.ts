export type LoraReception={gatewayId:string;rssi:number;snr:number;receivedAt:string};
export type VerifiedLoraUplink={eventId:string;deviceEui:string;frameCounter:number;payloadHash:string;receptions:LoraReception[];canonicalGatewayId:string};
export function canonicalizeLoraUplink(input:Omit<VerifiedLoraUplink,"canonicalGatewayId">):VerifiedLoraUplink{if(!input.receptions.length)throw new Error("At least one gateway reception is required");const best=[...input.receptions].sort((a,b)=>b.snr-a.snr||b.rssi-a.rssi)[0];return{...input,canonicalGatewayId:best.gatewayId}}
