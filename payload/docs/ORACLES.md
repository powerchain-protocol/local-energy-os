# Oracle Router

Applications use `OracleRouter`, not provider-specific APIs.

```text
Application → Oracle Router → Pyth / Chainlink → Oracle Policy → Canonical Value
```

Values carry feed id, provider, value, confidence, observed time, received time, and freshness. If all approved providers are stale or invalid, price-dependent operations fail safely.
