export async function getFiatRates(base = "EUR", symbols: readonly string[] = ["USD", "GBP"]) {
  const observedAt = new Date().toISOString();
  try {
    const url = new URL("/latest", process.env.FX_RATES_BASE_URL ?? "https://api.frankfurter.app");
    url.searchParams.set("from", base);
    url.searchParams.set("to", symbols.join(","));
    const response = await fetch(url, { next: { revalidate: 900 } });
    if (!response.ok) return { provider: "frankfurter-ecb", state: "unavailable" as const, observedAt, base, rates: null };
    const body = await response.json() as { base?: string; date?: string; rates?: Record<string, number> };
    return { provider: "frankfurter-ecb", state: "available" as const, observedAt, base: body.base ?? base, date: body.date, rates: body.rates ?? {} };
  } catch {
    return { provider: "frankfurter-ecb", state: "unavailable" as const, observedAt, base, rates: null };
  }
}
