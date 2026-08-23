import {
  availableBatchWh,
  type EnergyBatch,
  type EnergyPosition,
} from "@powerchain/energy-core";
import { validateRegistry, type EnergyRwaRegistry } from "@powerchain/energy-rwa";
import { matchLocalOrders, type EnergyOrder, type GridConstraint } from "@powerchain/local-energy-market";

export class LocalEnergyService {
  readonly batches = new Map<string, EnergyBatch>();
  readonly positions = new Map<string, EnergyPosition>();
  readonly rwa = new Map<string, EnergyRwaRegistry>();
  readonly orders = new Map<string, EnergyOrder>();

  putBatch(batch: EnergyBatch) {
    availableBatchWh(batch);
    this.batches.set(batch.id, batch);
    return batch;
  }

  putPosition(position: EnergyPosition) {
    const batch = this.batches.get(position.energyBatchId);
    if (!batch) throw new Error("Energy batch not found");
    if (position.amountWh > batch.verifiedWh) throw new Error("Position exceeds verified batch quantity");
    this.positions.set(position.id, position);
    return position;
  }

  putRwaRegistry(registry: EnergyRwaRegistry) {
    validateRegistry(registry);
    if (!this.positions.has(registry.energyPositionId)) throw new Error("Energy Position not found");
    this.rwa.set(registry.energyPositionId, registry);
    return registry;
  }

  createOrder(order: EnergyOrder) {
    if (order.amountWh <= 0n || order.remainingWh <= 0n) throw new Error("Order amount must be positive");
    this.orders.set(order.id, order);
    return order;
  }

  match(sellerOrderId: string, buyerOrderId: string, constraint: GridConstraint) {
    const seller = this.orders.get(sellerOrderId);
    const buyer = this.orders.get(buyerOrderId);
    if (!seller || !buyer) throw new Error("Order not found");
    return matchLocalOrders(seller, buyer, constraint);
  }
}

export const localEnergyService = new LocalEnergyService();
