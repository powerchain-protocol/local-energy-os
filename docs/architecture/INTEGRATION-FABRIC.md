# Integration Fabric

The Integration Fabric isolates external meters, grid services, blockchains, identity systems, and enterprise providers behind typed adapters. Each adapter normalizes requests, enforces timeouts, classifies errors, reports health, and returns provenance with every accepted observation.

No provider response is treated as live data unless its contract validates. Secrets remain server-side, retries are bounded and idempotent, and circuit-breaker state is exposed to operations without leaking credentials.
