import { reconcileDelivery } from "@powerchain/local-energy-settlement";

export interface DeliveryRecord {
  id: string;
  committedWh: bigint;
  deliveredWh: bigint;
}

export async function reconcileLocalEnergyDelivery(delivery: DeliveryRecord) {
  const reconciliation = reconcileDelivery(delivery.committedWh, delivery.deliveredWh);
  return {
    deliveryId: delivery.id,
    ...reconciliation,
    reconciledAt: new Date(),
  };
}
