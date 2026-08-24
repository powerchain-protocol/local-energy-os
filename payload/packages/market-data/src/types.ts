export type MarketDataProvider = "PYTH" | "BIRDEYE" | "COINMARKETCAP" | "DERIVED";

export interface PriceObservation {
  base: string;
  quote: string;
  value: string;
  scale: number;
  provider: MarketDataProvider;
  providerReference: string;
  observedAt: Date;
  receivedAt: Date;
  confidence?: string;
  state: "FRESH" | "STALE" | "INVALID";
}

export interface CurrencyRateRequest {
  base: string;
  quotes: string[];
}

export interface CurrencyRateResult {
  base: string;
  quote: string;
  rate: string;
  provider: MarketDataProvider;
  observedAt: Date;
  derivedFrom?: string[];
}
