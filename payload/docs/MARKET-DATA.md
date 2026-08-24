# Market Data & Currency Rates

PowerChain uses server-side adapters for Pyth, Birdeye, and CoinMarketCap. Secrets must never be embedded in browser bundles.

## Pyth

The adapter queries Hermes `v2/updates/price/latest`, parses the signed feed value, exponent, confidence, and publish time, and marks stale observations before they can enter price-sensitive settlement.

## Birdeye

Birdeye is used for token-level market data and optional PWRC/Solana asset price context. Requests use the configured `X-API-KEY` and `x-chain` headers.

## CoinMarketCap

CoinMarketCap can provide canonical cryptocurrency market quotes. Production uses the server-side API key; optional keyless/public use is disabled by default.

## Rate processing

Rates are processed using fixed-point integer arithmetic. Cross rates can be derived through USD only when both source observations are fresh.
