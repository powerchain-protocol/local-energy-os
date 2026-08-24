export type ProviderState = "available" | "unconfigured" | "unavailable";
export async function getCoinMarketCapQuotes(symbols: readonly string[]) {
  const key = process.env.COINMARKETCAP_API_KEY;
  const observedAt = new Date().toISOString();
  if (!key) return { provider: "coinmarketcap" as const, state: "unconfigured" as ProviderState, observedAt, data: null };
  try {
    const url = new URL("/v2/cryptocurrency/quotes/latest", process.env.COINMARKETCAP_BASE_URL ?? "https://pro-api.coinmarketcap.com");
    url.searchParams.set("symbol", symbols.join(","));
    const response = await fetch(url, { headers: { "X-CMC_PRO_API_KEY": key, Accept: "application/json" }, next: { revalidate: 60 } });
    if (!response.ok) return { provider: "coinmarketcap" as const, state: "unavailable" as ProviderState, observedAt, data: null, status: response.status };
    return { provider: "coinmarketcap" as const, state: "available" as ProviderState, observedAt, data: await response.json() };
  } catch {
    return { provider: "coinmarketcap" as const, state: "unavailable" as ProviderState, observedAt, data: null };
  }
}
