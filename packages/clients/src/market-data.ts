export type MarketAssetId = string;
export interface MarketPrice { assetId: MarketAssetId; symbol: string; priceUsd: number; observedAt: string; provider: string; confidence?: number; }
export interface MarketQuote { base: string; quote: string; price: number; observedAt: string; provider: string; }
export interface MarketDataProvider { readonly id: string; price(assetId: MarketAssetId, signal?: AbortSignal): Promise<MarketPrice>; quote(base: string, quote: string, signal?: AbortSignal): Promise<MarketQuote>; }
export class MarketDataClient {
  constructor(private readonly providers: readonly MarketDataProvider[]) { if (!providers.length) throw new Error("MARKET_DATA_PROVIDER_REQUIRED"); }
  async price(assetId: MarketAssetId, signal?: AbortSignal): Promise<MarketPrice> {
    const failures: string[] = []; for (const provider of this.providers) { try { return await provider.price(assetId, signal); } catch (error) { failures.push(`${provider.id}:${error instanceof Error ? error.message : "unknown"}`); } }
    throw new Error(`MARKET_DATA_UNAVAILABLE:${failures.join("|")}`);
  }
  async quote(base: string, quote: string, signal?: AbortSignal): Promise<MarketQuote> {
    const failures: string[] = []; for (const provider of this.providers) { try { return await provider.quote(base, quote, signal); } catch (error) { failures.push(`${provider.id}:${error instanceof Error ? error.message : "unknown"}`); } }
    throw new Error(`MARKET_DATA_UNAVAILABLE:${failures.join("|")}`);
  }
  providersList() { return this.providers.map((provider) => provider.id); }
}
