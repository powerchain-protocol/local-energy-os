import {
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  getLocalEnergyOverview,
  listLocalEnergyOrders,
  localEnergyError,
  localEnergyResponse,
  publicLocalEnergyOrder,
} from "@/lib/local-energy/server";

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    const [overview,orders]=await Promise.all([getLocalEnergyOverview(context),listLocalEnergyOrders(context)]);
    return localEnergyResponse({
      summary:{
        dataState:overview.community.dataState,
        source:overview.community.source,
        members:overview.community.members,
        producers:overview.community.producers,
        consumers:overview.community.consumers,
        batteries:overview.community.batteries,
        localSupplyKwh:overview.community.localSupplyWh===null?null:Number(overview.community.localSupplyWh)/1_000,
        localDemandKwh:overview.community.localDemandWh===null?null:Number(overview.community.localDemandWh)/1_000,
        matchedPercent:overview.community.matchedPercent,
        averagePrice:overview.community.averagePrice,
        carbonAvoidedKg:overview.community.carbonAvoidedKg,
      },
      recentOrders:orders.slice(0,10).map(publicLocalEnergyOrder),
      updatedAt:new Date().toISOString(),
    },context);
  }catch(error){
    return localEnergyError(error,context);
  }
}
