# Safe Actions & Rate Limiting

State-changing API operations require an idempotency key, authorization scope, and runtime policy validation. Chain writes and bridge operations use stricter rate limits.

Rate limiting is adapter-based. The included in-memory sliding-window implementation is suitable for single-process development; production should bind the same decision contract to Redis or an equivalent distributed store.
