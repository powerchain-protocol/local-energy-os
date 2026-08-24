export type EnergyWh = bigint;

export const WH = 1n;
export const KWH = 1_000n;
export const MWH = 1_000_000n;
export const GWH = 1_000_000_000n;

export type EnergyDisplayUnit = "Wh" | "kWh" | "MWh" | "GWh";

const FACTORS: Record<EnergyDisplayUnit, bigint> = {
  Wh: WH,
  kWh: KWH,
  MWh: MWH,
  GWh: GWH,
};

export function toWh(value: bigint, unit: EnergyDisplayUnit): EnergyWh {
  if (value < 0n) throw new RangeError("Energy quantity cannot be negative");
  return value * FACTORS[unit];
}

export function splitEnergy(valueWh: EnergyWh, unit: EnergyDisplayUnit) {
  const factor = FACTORS[unit];
  return { whole: valueWh / factor, remainderWh: valueWh % factor, factor };
}

export function assertEnergyWh(value: bigint): asserts value is EnergyWh {
  if (value < 0n) throw new RangeError("Energy quantity cannot be negative");
}
