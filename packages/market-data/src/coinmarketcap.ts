import { fetchJson } from "./http.js";
import { formatDecimal, parseDecimal, RATE_SCALE } from "./fixed-decimal.js";
import type { PriceObservation } from "./types.js";

interface CmcQuote { price?: number | string; last_updated?: string }
interface CmcAsset { id: number; symbol: string; quote: Record<string, CmcQuote> }
interface CmcResponse { data?: Record<string, CmcAsset> | CmcAsset[] }

export interface CoinMarketCapOptions {
  apiKey?: string;
  baseUrl?: string;
  allowPublicEndpoint?: boolean;
}

export class CoinMarketCapPriceClient {
  private readonly baseUrl: string;
  constructor(private readonly options: CoinMarketCapOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://pro-api.coinmarketcap.com";
  }

  async latest(args: { symbol?: string; id?: string; quote?: string }): Promise<PriceObservation> {
    const prefix = !this.options.apiKey && this.options.allowPublicEndpoint ? "/public-api" : "";
    if (!this.options.apiKey && !this.options.allowPublicEndpoint) throw new Error("CMC_API_KEY_REQUIRED");
    const url = new URL(`${prefix}/v3/cryptocurrency/quotes/latest`, this.baseUrl);
    if (args.id) url.searchParams.set("id", args.id); else if (args.symbol) url.searchParams.set("symbol", args.symbol); else throw new Error("CMC_ID_OR_SYMBOL_REQUIRED");
    const quote = (args.quote ?? "USD").toUpperCase();
    url.searchParams.set("convert", quote);
    const headers: Record<string,string> = {};
    if (this.options.apiKey) headers["X-CMC_PRO_API_KEY"] = this.options.apiKey;
    const response = await fetchJson<CmcResponse>(url.toString(), { headers });
    const values = Array.isArray(response.data) ? response.data : Object.values(response.data ?? {});
    const asset = values[0];
    const q = asset?.quote?.[quote];
    if (!asset || q?.price === undefined) throw new Error("CMC_PRICE_UNAVAILABLE");
    const scaled = parseDecimal(q.price, RATE_SCALE);
    return {
      base: asset.symbol.toUpperCase(), quote,
      value: formatDecimal(scaled), scale: RATE_SCALE, provider: "COINMARKETCAP",
      providerReference: String(asset.id),
      observedAt: q.last_updated ? new Date(q.last_updated) : new Date(), receivedAt: new Date(), state: "FRESH",
    };
  }
}
