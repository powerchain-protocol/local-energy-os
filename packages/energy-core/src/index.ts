export type EnergyWh = bigint;
export const WH = 1n;
export const KWH = 1_000n;
export const MWH = 1_000_000n;
export const GWH = 1_000_000_000n;

export function assertNonNegative(value: bigint, field: string) {
  if (value < 0n) throw new Error(`NEGATIVE_${field.toUpperCase()}`);
}

export function assertPhysicalSupply(input: {
  verifiedWh: bigint; invalidatedWh?: bigint; positionedWh: bigint; reservedUnpositionedWh?: bigint;
}) {
  const invalidatedWh = input.invalidatedWh ?? 0n;
  const reserved = input.reservedUnpositionedWh ?? 0n;
  [input.verifiedWh, invalidatedWh, input.positionedWh, reserved].forEach((v, i) => assertNonNegative(v, `supply_${i}`));
  const availableBacking = input.verifiedWh - invalidatedWh;
  if (input.positionedWh + reserved > availableBacking) throw new Error("ENERGY_RWA_OVERISSUANCE");
}

function formatScaledEnergy(wh: bigint, scale: bigint): string {
  const negative = wh < 0n;
  const absolute = negative ? -wh : wh;
  const whole = absolute / scale;
  const fractional = ((absolute % scale) * 1_000n) / scale;
  return `${negative ? "-" : ""}${whole.toString()}.${fractional.toString().padStart(3, "0")}`;
}

export function formatEnergy(wh: bigint): { value: string; unit: "Wh" | "kWh" | "MWh" | "GWh" } {
  const abs = wh < 0n ? -wh : wh;
  if (abs >= GWH) return { value: formatScaledEnergy(wh, GWH), unit: "GWh" };
  if (abs >= MWH) return { value: formatScaledEnergy(wh, MWH), unit: "MWh" };
  if (abs >= KWH) return { value: formatScaledEnergy(wh, KWH), unit: "kWh" };
  return { value: wh.toString(), unit: "Wh" };
}
