# PowerChain AI Gateway

Controlled GridLLM inference service on port `3104`. It validates request size,
applies the canonical model configuration, preserves request IDs, and routes
through the shared AI gateway boundary.

Run with `pnpm --filter @powerchain/ai-gateway-app dev`.
