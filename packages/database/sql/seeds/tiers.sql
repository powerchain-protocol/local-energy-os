-- Tier definitions are application-owned in tiers.ts; this seed records deployment metadata only.
SELECT now() AS seeded_at, 'starter,prosumer,business,enterprise' AS tiers;
