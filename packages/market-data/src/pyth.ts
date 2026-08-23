import { fetchJson } from "./http.js";
import { formatDecimal, RATE_SCALE } from "./fixed-decimal.js";
import type { PriceObservation } from "./types.js";

interface PythParsedPrice {
  id: string;
  price: { price: string; conf: string; expo: number; publish_time: number };
}
interface PythResponse { parsed?: PythParsedPrice[] }

export interface PythClientOptions {
  baseUrl?: string;
  apiKey?: string;
  maxAgeSeconds?: number;
}

function pythToScaled(price: string, exponent: number): bigint {
  const raw = BigInt(price);
  if (exponent >= 0) return raw * (10n ** BigInt(exponent + RATE_SCALE));
  const decimalPlaces = -exponent;
  if (decimalPlaces <= RATE_SCALE) return raw * (10n ** BigInt(RATE_SCALE - decimalPlaces));
  return raw / (10n ** BigInt(decimalPlaces - RATE_SCALE));
}

export class PythPriceClient {
  readonly baseUrl: string;
  constructor(private readonly options: PythClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://pyth.dourolabs.app/hermes";
  }

  async latest(args: { feedId: string; base: string; quote: string }): Promise<PriceObservation> {
    const url = new URL("/v2/updates/price/latest", this.baseUrl);
    url.searchParams.append("ids[]", args.feedId);
    url.searchParams.set("parsed", "true");
    const headers: Record<string,string> = {};
    if (this.options.apiKey) headers.authorization = `Bearer ${this.options.apiKey}`;
    const response = await fetchJson<PythResponse>(url.toString(), { headers });
    const parsed = response.parsed?.[0];
    if (!parsed) throw new Error(`PYTH_FEED_NOT_FOUND:${args.feedId}`);
    const observedAt = new Date(parsed.price.publish_time * 1000);
    const ageSeconds = Math.max(0, (Date.now() - observedAt.getTime()) / 1000);
    const maxAge = this.options.maxAgeSeconds ?? 60;
    const scaled = pythToScaled(parsed.price.price, parsed.price.expo);
    const confScaled = pythToScaled(parsed.price.conf, parsed.price.expo);
    return {
      base: args.base.toUpperCase(), quote: args.quote.toUpperCase(),
      value: formatDecimal(scaled), scale: RATE_SCALE, provider: "PYTH",
      providerReference: parsed.id, observedAt, receivedAt: new Date(),
      confidence: formatDecimal(confScaled), state: ageSeconds <= maxAge ? "FRESH" : "STALE",
    };
  }
}
