import {
  enforceLocalEnergyRateLimit,
  getLocalEnergyContext,
  getLocalEnergyOverview,
  localEnergyError,
  localEnergyResponse,
} from "@/lib/local-energy/server";

export async function GET(request:Request){
  const context=await getLocalEnergyContext(request);
  try{
    enforceLocalEnergyRateLimit(request,context);
    return localEnergyResponse(await getLocalEnergyOverview(context),context);
  }catch(error){
    return localEnergyError(error,context);
  }
}
