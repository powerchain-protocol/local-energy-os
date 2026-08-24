import { getPythPrices } from "./pyth";

const fallback: Record<string, number> = { USDC: 1, PWRC: 0.42 };

export async function getPrices(symbols: string[]) {
  const normalized = [...new Set(symbols.map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 10);
  let pyth: unknown = null;
  try { pyth = await getPythPrices(normalized); } catch { /* provider remains optional in beta */ }
  return {
    currency: "USD",
    updatedAt: new Date().toISOString(),
    values: Object.fromEntries(normalized.map((symbol) => [symbol, fallback[symbol] ?? null])),
    providerData: pyth,
  };
}
