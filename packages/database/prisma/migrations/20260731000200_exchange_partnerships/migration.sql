BEGIN;
CREATE TABLE IF NOT EXISTS exchange_orders (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  commodity TEXT NOT NULL CHECK (commodity IN ('SOLAR_MWH','WIND_MWH','HYDRO_MWH','REC','CRT')),
  side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  quantity NUMERIC(24,8) NOT NULL CHECK (quantity > 0),
  limit_price NUMERIC(24,8) NOT NULL CHECK (limit_price > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD','USDC','PWRC')),
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS exchange_orders_org_created_idx ON exchange_orders (organization_id, created_at DESC);
CREATE TABLE IF NOT EXISTS partnerships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'prospect',
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);
COMMIT;
