export function calculateEnergySettlement(amountKwh: bigint, priceMicrosPerKwh: bigint): bigint {
  if (amountKwh <= 0n) throw new Error("Energy amount must be positive");
  if (priceMicrosPerKwh < 0n) throw new Error("Price cannot be negative");
  return amountKwh * priceMicrosPerKwh;
}

export function calculateCarbonCredits(amountKwh: bigint, gramsCo2AvoidedPerKwh: bigint): bigint {
  if (amountKwh < 0n || gramsCo2AvoidedPerKwh < 0n) throw new Error("Inputs cannot be negative");
  return amountKwh * gramsCo2AvoidedPerKwh;
}
