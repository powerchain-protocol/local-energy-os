import type { PriceObservation } from "./types.js";

export interface PriceSource {
  name: string;
  fetch(): Promise<PriceObservation>;
}

export class MarketPriceRouter {
  constructor(private readonly maxAgeMs = 60_000) {}
  async firstFresh(sources: readonly PriceSource[]): Promise<PriceObservation> {
    const errors: string[] = [];
    for (const source of sources) {
      try {
        const value = await source.fetch();
        const staleByClock = Date.now() - value.observedAt.getTime() > this.maxAgeMs;
        if (value.state === "FRESH" && !staleByClock) return value;
        errors.push(`${source.name}:STALE`);
      } catch (error) { errors.push(`${source.name}:${String(error)}`); }
    }
    throw new Error(`MARKET_PRICE_UNAVAILABLE:${errors.join("|")}`);
  }
}
