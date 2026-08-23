import type { EnergyWh } from "@powerchain/energy-core";

export interface DeliveryReconciliation {
  committedWh: EnergyWh;
  deliveredWh: EnergyWh;
  varianceWh: bigint;
}

export interface LedgerPosting {
  account: string;
  side: "DR" | "CR";
  amountMinor: bigint;
  currency: "EUR" | "EURC" | "USDC" | "PWRC";
}

export function reconcileDelivery(committedWh: EnergyWh, deliveredWh: EnergyWh): DeliveryReconciliation {
  return {
    committedWh,
    deliveredWh,
    varianceWh: deliveredWh - committedWh,
  };
}

export function settlementAmountMinor(
  deliveredWh: EnergyWh,
  priceMinorPerKwh: bigint,
): bigint {
  // Price is expressed in minor currency units per kWh.
  // Integer division intentionally settles only the configured minor-unit precision.
  return (deliveredWh * priceMinorPerKwh) / 1_000n;
}

export function createEnergySalePostings(args: {
  buyerExpenseAccount: string;
  sellerPayableAccount: string;
  feePayableAccount: string;
  grossMinor: bigint;
  feeMinor: bigint;
  currency: LedgerPosting["currency"];
}): LedgerPosting[] {
  if (args.feeMinor < 0n || args.feeMinor > args.grossMinor) throw new Error("Invalid fee");
  return [
    { account: args.buyerExpenseAccount, side: "DR", amountMinor: args.grossMinor, currency: args.currency },
    { account: args.sellerPayableAccount, side: "CR", amountMinor: args.grossMinor - args.feeMinor, currency: args.currency },
    { account: args.feePayableAccount, side: "CR", amountMinor: args.feeMinor, currency: args.currency },
  ];
}
