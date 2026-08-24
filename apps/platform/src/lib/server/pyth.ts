const DEFAULT_FEEDS: Record<string, string> = {
  SOL: "ef0d8b6fda2ceba41c6b0b6c5ef5f08ad26a3c2f8e0f69792e7c6f708d2b4f4d",
};

export async function getPythPrices(symbols: string[]) {
  const base = process.env.PYTH_PRICE_SERVICE_URL ?? "https://hermes.pyth.network";
  const ids = symbols.map((symbol) => DEFAULT_FEEDS[symbol]).filter(Boolean);
  if (!ids.length) return [];
  const query = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");
  const response = await fetch(`${base}/v2/updates/price/latest?${query}`, { next: { revalidate: 20 } });
  if (!response.ok) throw new Error(`Pyth request failed: ${response.status}`);
  return response.json();
}
