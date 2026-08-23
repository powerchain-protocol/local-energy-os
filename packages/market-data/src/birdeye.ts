import { fetchJson } from "./http.js";
import { parseDecimal, formatDecimal, RATE_SCALE } from "./fixed-decimal.js";
import type { PriceObservation } from "./types.js";

interface BirdeyeResponse { success?: boolean; data?: { value?: number | string; updateUnixTime?: number } }

export class BirdeyePriceClient {
  constructor(private readonly apiKey: string, private readonly baseUrl = "https://public-api.birdeye.so") {
    if (!apiKey) throw new Error("BIRDEYE_API_KEY_REQUIRED");
  }

  async latest(args: { address: string; chain?: string; base: string; quote?: string }): Promise<PriceObservation> {
    const url = new URL("/defi/price", this.baseUrl);
    url.searchParams.set("address", args.address);
    url.searchParams.set("include_liquidity", "true");
    const response = await fetchJson<BirdeyeResponse>(url.toString(), {
      headers: { "X-API-KEY": this.apiKey, "x-chain": args.chain ?? "solana" },
    });
    if (!response.success || response.data?.value === undefined) throw new Error("BIRDEYE_PRICE_UNAVAILABLE");
    const scaled = parseDecimal(response.data.value, RATE_SCALE);
    const observedAt = response.data.updateUnixTime ? new Date(response.data.updateUnixTime * 1000) : new Date();
    return {
      base: args.base.toUpperCase(), quote: (args.quote ?? "USD").toUpperCase(),
      value: formatDecimal(scaled), scale: RATE_SCALE, provider: "BIRDEYE",
      providerReference: args.address, observedAt, receivedAt: new Date(), state: "FRESH",
    };
  }
}
