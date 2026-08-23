import type { EnergyWh } from "@powerchain/energy-core";

export interface EnergyOrder {
  id: string;
  ownerId: string;
  side: "BUY" | "SELL";
  amountWh: EnergyWh;
  remainingWh: EnergyWh;
  priceMinorPerKwh: bigint;
  currency: "EUR" | "EURC" | "USDC" | "PWRC";
  gridAreaId: string;
  sourcePreference?: string[];
}

export interface GridConstraint {
  gridAreaId: string;
  maxTransferWh: EnergyWh;
}

export interface MatchResult {
  sellerOrderId: string;
  buyerOrderId: string;
  matchedWh: EnergyWh;
  priceMinorPerKwh: bigint;
  currency: EnergyOrder["currency"];
  gridAreaId: string;
}

export function matchLocalOrders(
  seller: EnergyOrder,
  buyer: EnergyOrder,
  constraint: GridConstraint,
): MatchResult | null {
  if (seller.side !== "SELL" || buyer.side !== "BUY") return null;
  if (seller.currency !== buyer.currency) return null;
  if (seller.gridAreaId !== buyer.gridAreaId || constraint.gridAreaId !== seller.gridAreaId) return null;
  if (seller.priceMinorPerKwh > buyer.priceMinorPerKwh) return null;

  const amount = [seller.remainingWh, buyer.remainingWh, constraint.maxTransferWh]
    .reduce((minimum, value) => value < minimum ? value : minimum);

  if (amount <= 0n) return null;

  return {
    sellerOrderId: seller.id,
    buyerOrderId: buyer.id,
    matchedWh: amount,
    priceMinorPerKwh: seller.priceMinorPerKwh,
    currency: seller.currency,
    gridAreaId: seller.gridAreaId,
  };
}
