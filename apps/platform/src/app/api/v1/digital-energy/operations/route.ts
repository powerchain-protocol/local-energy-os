import { digitalEnergyError, digitalEnergyResponse, enforceDigitalEnergyRateLimit, getDigitalEnergyContext } from "@/lib/digital-energy/server";
import { getEnergyOperationsSnapshot } from "@/lib/digital-energy/operations-server";
export async function GET(request:Request){const context=await getDigitalEnergyContext(request);try{enforceDigitalEnergyRateLimit(request,context);return digitalEnergyResponse(await getEnergyOperationsSnapshot(context),context)}catch(error){return digitalEnergyError(error,context)}}
