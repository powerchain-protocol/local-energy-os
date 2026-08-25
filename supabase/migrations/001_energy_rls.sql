-- Apply only after mapping application user/org membership tables to your Better Auth schema.
alter table if exists energy_batches enable row level security;
alter table if exists energy_positions enable row level security;
-- Canonical production policy should resolve organization membership from a server-maintained membership table.
-- Service-role integrations bypass RLS only in trusted backend contexts.
