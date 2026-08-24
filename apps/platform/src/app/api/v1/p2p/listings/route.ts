import {
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  listLocalEnergyListings,
  localEnergyError,
  localEnergyResponse,
  publicLocalEnergyListing,
} from "@/lib/local-energy/server";

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    const url=new URL(request.url);
    const rawMode=url.searchParams.get("mode")?.toUpperCase();
    const rawSource=url.searchParams.get("source")?.toUpperCase();
    const quantityKwh=Number(url.searchParams.get("quantity")||0);
    const maxDistanceKm=Number(url.searchParams.get("radius")||50);

    const listings=(await listLocalEnergyListings(context,{
      ...(rawMode&&["BUY","SELL","RENT"].includes(rawMode)?{mode:rawMode as "BUY"|"SELL"|"RENT"}:{}),
      ...(rawSource&&["SOLAR","WIND","HYDRO","BATTERY","MIXED"].includes(rawSource)?{source:rawSource as "SOLAR"|"WIND"|"HYDRO"|"BATTERY"|"MIXED"}:{}),
    }))
      .map(publicLocalEnergyListing)
      .filter(item=>!Number.isFinite(maxDistanceKm)||item.distanceKm<=Math.max(1,maxDistanceKm))
      .filter(item=>!quantityKwh||item.availableKwh>=quantityKwh);

    return localEnergyResponse(listings,context);
  }catch(error){
    return localEnergyError(error,context);
  }
}
