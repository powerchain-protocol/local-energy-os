import type { BackendConfig } from "../config.js";
export interface SymbolPrice { symbol: string; priceUsd: number; observedAt: string; provider: string; }
export async function getMarketPrices(config: BackendConfig, symbols: string[], signal?: AbortSignal): Promise<SymbolPrice[]> {
  if (!config.MARKET_DATA_BASE_URL || config.MARKET_DATA_PROVIDER === "unconfigured") throw Object.assign(new Error("Market-data provider is not configured"), { code: "MARKET_DATA_UNCONFIGURED", status: 503 });
  const url = new URL("prices", config.MARKET_DATA_BASE_URL.endsWith("/") ? config.MARKET_DATA_BASE_URL : `${config.MARKET_DATA_BASE_URL}/`);
  url.searchParams.set("symbols", symbols.join(","));
  const response = await fetch(url, { headers: config.MARKET_DATA_API_KEY ? { authorization: `Bearer ${config.MARKET_DATA_API_KEY}` } : undefined, signal });
  if (!response.ok) throw Object.assign(new Error(`Market-data provider returned HTTP ${response.status}`), { code: "MARKET_DATA_UNAVAILABLE", status: 502 });
  const body = await response.json() as unknown;
  if (!Array.isArray(body)) throw Object.assign(new Error("Market-data provider returned an invalid response"), { code: "MARKET_DATA_INVALID_RESPONSE", status: 502 });
  return body.map((row: any) => ({ symbol: String(row.symbol).toUpperCase(), priceUsd: Number(row.priceUsd), observedAt: String(row.observedAt ?? new Date().toISOString()), provider: config.MARKET_DATA_PROVIDER })).filter(row => Number.isFinite(row.priceUsd));
}
