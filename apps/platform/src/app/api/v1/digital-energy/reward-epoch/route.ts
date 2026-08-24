import { getDigitalEnergyRewardEpoch } from "@/lib/digital-energy/reward-epoch";
import { digitalEnergyError, digitalEnergyResponse, enforceDigitalEnergyRateLimit, getDigitalEnergyContext, getDigitalEnergySnapshot } from "@/lib/digital-energy/server";
export async function GET(request:Request){const context=await getDigitalEnergyContext(request);try{enforceDigitalEnergyRateLimit(request,context);const snapshot=await getDigitalEnergySnapshot(context);return digitalEnergyResponse(getDigitalEnergyRewardEpoch(snapshot.summary),context)}catch(error){return digitalEnergyError(error,context)}}
