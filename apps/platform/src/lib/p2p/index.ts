import { localEnergyListings } from "@/data/p2p-energy";
import type { EnergySource, ListingMode, P2PMatch } from "@/types/p2p";

export function findLocalEnergyMatches(input:{mode?:ListingMode;source?:EnergySource;maxDistanceKm?:number;quantityKwh?:number}):P2PMatch[]{
  const maxDistance=Math.max(1,input.maxDistanceKm??50);
  return localEnergyListings
    .filter(item=>item.status==="active")
    .filter(item=>!input.mode||item.mode===input.mode)
    .filter(item=>!input.source||item.source===input.source)
    .filter(item=>item.distanceKm<=maxDistance)
    .filter(item=>!input.quantityKwh||item.availableKwh>=input.quantityKwh)
    .map(listing=>{
      const localScore=Math.max(0,1-listing.distanceKm/maxDistance);
      const greenScore=listing.renewablePercent/100;
      const priceScore=Math.max(0,1-listing.pricePerKwh/0.25);
      const verificationScore=(listing.verified?0.5:0)+(listing.meterVerified?0.5:0);
      const score=Math.round((localScore*.32+greenScore*.28+priceScore*.2+verificationScore*.2)*100);
      const quantity=input.quantityKwh??Math.min(100,listing.availableKwh);
      const deliveryConfidence=Math.min(99,Math.round(78+verificationScore*12+greenScore*6));
      return {listing,score,estimatedSavings:Number((quantity*Math.max(0,.16-listing.pricePerKwh)).toFixed(2)),estimatedCarbonKg:Number((quantity*.29*listing.renewablePercent/100).toFixed(1)),deliveryConfidence};
    }).sort((a,b)=>b.score-a.score);
}

export function calculateTradeTotal(quantityKwh:number,pricePerKwh:number,networkFeeRate=.0125,escrowRate=.02){
  const safeQuantity=Math.max(0,quantityKwh);
  const safePrice=Math.max(0,pricePerKwh);
  const subtotal=safeQuantity*safePrice;
  const networkFee=subtotal*networkFeeRate;
  const escrowReserve=subtotal*escrowRate;
  return {subtotal,networkFee,escrowReserve,total:subtotal+networkFee+escrowReserve};
}

export function validateP2PQuantity(quantity:number,minimum:number,available:number){
  if(!Number.isFinite(quantity)) return "Enter a valid quantity.";
  if(quantity<minimum) return `Minimum quantity is ${minimum} kWh.`;
  if(quantity>available) return `Only ${available} kWh is available.`;
  return null;
}
