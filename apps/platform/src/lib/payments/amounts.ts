import { PowerChainError } from "@/utils/errors";
export function parseUnits(value: string, decimals: number): bigint {
  if (!/^\d+(?:\.\d+)?$/.test(value)) throw new PowerChainError("Invalid payment amount", "VALIDATION_ERROR", 400);
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) throw new PowerChainError(`Amount supports at most ${decimals} decimals`, "VALIDATION_ERROR", 400);
  const result = BigInt(whole) * 10n ** BigInt(decimals) + BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0");
  if (result <= 0n) throw new PowerChainError("Payment amount must be greater than zero", "VALIDATION_ERROR", 400);
  return result;
}
export function formatUnits(value: bigint, decimals: number): string {
  const scale = 10n ** BigInt(decimals); const whole = value / scale; const fraction = (value % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}
