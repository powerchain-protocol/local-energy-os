# Marketplace architecture

The marketplace workflow is discovery, reservation, grid validation, order review, signature, funding, metered delivery, and settlement. Listings declare seller, region, commodity, quantity, price, delivery window, provenance, and verification state.

Production execution requires tenant authorization, inventory locking, idempotent order creation, tamper-evident events, payment controls, and reconciliation against verified meter delivery. Illustrative UI data must never be presented as a completed trade.
