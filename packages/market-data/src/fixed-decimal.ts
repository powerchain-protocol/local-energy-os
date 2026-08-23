export const RATE_SCALE = 12;
export const RATE_FACTOR = 10n ** BigInt(RATE_SCALE);

export function parseDecimal(value: string | number, scale = RATE_SCALE): bigint {
  const text = String(value).trim();
  if (!/^-?\d+(\.\d+)?$/.test(text)) throw new TypeError(`Invalid decimal: ${text}`);
  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  const [whole = "0", fraction = ""] = unsigned.split(".");
  const padded = (fraction + "0".repeat(scale)).slice(0, scale);
  const result = BigInt(whole) * (10n ** BigInt(scale)) + BigInt(padded || "0");
  return negative ? -result : result;
}

export function formatDecimal(value: bigint, scale = RATE_SCALE): string {
  const negative = value < 0n;
  const unsigned = negative ? -value : value;
  const factor = 10n ** BigInt(scale);
  const whole = unsigned / factor;
  const frac = (unsigned % factor).toString().padStart(scale, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${frac ? "." + frac : ""}`;
}

export function multiplyFixed(a: bigint, b: bigint, scale = RATE_SCALE): bigint {
  return (a * b) / (10n ** BigInt(scale));
}

export function divideFixed(a: bigint, b: bigint, scale = RATE_SCALE): bigint {
  if (b === 0n) throw new RangeError("Division by zero");
  return (a * (10n ** BigInt(scale))) / b;
}
