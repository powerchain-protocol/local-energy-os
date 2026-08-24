import {
  getDigitalEnergyOutboxPublisherHealth,
  getEnergyOperationsSnapshot,
  getPendingEnergyOutbox,
} from "@/lib/digital-energy/operations-server";
import {
  digitalEnergyError,
  digitalEnergyResponse,
  enforceDigitalEnergyRateLimit,
  getDigitalEnergyContext,
  requireDigitalEnergySettlementApprover,
} from "@/lib/digital-energy/server";

export async function GET(request:Request){
  const context=await getDigitalEnergyContext(request);
  try{
    enforceDigitalEnergyRateLimit(request,context);
    requireDigitalEnergySettlementApprover(context);
    const [operations,outbox,publisher]=await Promise.all([
      getEnergyOperationsSnapshot(context),
      getPendingEnergyOutbox(context,50),
      getDigitalEnergyOutboxPublisherHealth(),
    ]);
    return digitalEnergyResponse({
      controls:operations.controls??null,
      publisher,
      settlements:operations.settlements.map(item=>({
        id:item.id,
        state:item.state,
        asset:item.asset,
        network:item.network,
        amountMinor:item.amountMinor,
        reviewHash:item.reviewHash,
        createdBy:item.createdBy,
        approvalsRequired:item.approvalsRequired,
        control:item.control,
      })),
      outbox,
    },context);
  }catch(error){
    return digitalEnergyError(error,context);
  }
}
