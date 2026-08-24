import { getEnergyOperationsSnapshot } from "@/lib/digital-energy/operations-server";
import { getDigitalEnergyProviderState } from "@/lib/digital-energy/providers";
import { getDigitalEnergyRewardEpoch } from "@/lib/digital-energy/reward-epoch";
import { digitalEnergyError, digitalEnergyResponse, enforceDigitalEnergyRateLimit, getDigitalEnergyContext, getDigitalEnergySnapshot } from "@/lib/digital-energy/server";

export async function GET(request: Request) {
  const context = await getDigitalEnergyContext(request);
  try {
    enforceDigitalEnergyRateLimit(request, context);
    const snapshot = await getDigitalEnergySnapshot(context);
    const coreDataMode = context.dataMode;
    const operations = await getEnergyOperationsSnapshot(context);
    const operationsDataMode = context.dataMode;
    const providers = await getDigitalEnergyProviderState();
    const aggregateDataMode = coreDataMode === "DEGRADED" || operationsDataMode === "DEGRADED"
      ? "DEGRADED"
      : coreDataMode === "LIVE" && operationsDataMode === "LIVE"
        ? "LIVE"
        : "DEMO";
    context.dataMode = aggregateDataMode;
    const rewardEpoch = getDigitalEnergyRewardEpoch(snapshot.summary);
    return digitalEnergyResponse({
      ...snapshot,
      summary: { ...snapshot.summary, dataMode: aggregateDataMode },
      providers,
      rewardEpoch,
      operations: { ...operations, dataMode: operationsDataMode },
    }, context);
  } catch (error) { return digitalEnergyError(error, context); }
}
