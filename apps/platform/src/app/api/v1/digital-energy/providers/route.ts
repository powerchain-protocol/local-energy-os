import { getDigitalEnergyProviderState } from "@/lib/digital-energy/providers";
import { digitalEnergyError, digitalEnergyResponse, enforceDigitalEnergyRateLimit, getDigitalEnergyContext } from "@/lib/digital-energy/server";
export async function GET(request:Request){const context=await getDigitalEnergyContext(request);try{enforceDigitalEnergyRateLimit(request,context);return digitalEnergyResponse(await getDigitalEnergyProviderState(),context)}catch(error){return digitalEnergyError(error,context)}}
