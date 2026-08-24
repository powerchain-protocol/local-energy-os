import { divideFixed, formatDecimal, parseDecimal, RATE_SCALE } from "./fixed-decimal.js";
import type { CurrencyRateRequest, CurrencyRateResult, PriceObservation } from "./types.js";

function key(base: string, quote: string) { return `${base.toUpperCase()}/${quote.toUpperCase()}`; }

export function processCurrencyRates(request: CurrencyRateRequest, observations: readonly PriceObservation[]): CurrencyRateResult[] {
  const base = request.base.toUpperCase();
  const fresh = observations.filter((o) => o.state === "FRESH");
  const direct = new Map(fresh.map((o) => [key(o.base, o.quote), o]));
  const result: CurrencyRateResult[] = [];

  for (const q0 of request.quotes) {
    const quote = q0.toUpperCase();
    if (quote === base) {
      result.push({ base, quote, rate: "1", provider: "DERIVED", observedAt: new Date(), derivedFrom: ["IDENTITY"] });
      continue;
    }
    const d = direct.get(key(base, quote));
    if (d) {
      result.push({ base, quote, rate: d.value, provider: d.provider, observedAt: d.observedAt });
      continue;
    }
    const inverse = direct.get(key(quote, base));
    if (inverse) {
      const inv = divideFixed(10n ** BigInt(RATE_SCALE), parseDecimal(inverse.value), RATE_SCALE);
      result.push({ base, quote, rate: formatDecimal(inv), provider: "DERIVED", observedAt: inverse.observedAt, derivedFrom: [key(quote, base)] });
      continue;
    }
    // Derive via USD when both legs exist.
    const baseUsd = direct.get(key(base, "USD"));
    const quoteUsd = direct.get(key(quote, "USD"));
    if (baseUsd && quoteUsd) {
      const cross = divideFixed(parseDecimal(baseUsd.value), parseDecimal(quoteUsd.value));
      result.push({ base, quote, rate: formatDecimal(cross), provider: "DERIVED", observedAt: new Date(Math.min(baseUsd.observedAt.getTime(), quoteUsd.observedAt.getTime())), derivedFrom: [key(base,"USD"), key(quote,"USD")] });
    }
  }
  return result;
}
