begin;

alter table energy_batches add column if not exists tenant_id text;
alter table energy_batches add column if not exists organization_id text;
alter table energy_batches add column if not exists company_id text;

alter table energy_positions add column if not exists tenant_id text;
alter table energy_positions add column if not exists organization_id text;
alter table energy_positions add column if not exists company_id text;

create table if not exists energy_rwa_assets (
  id text primary key,
  tenant_id text not null,
  organization_id text not null,
  company_id text,
  energy_position_id text not null unique references energy_positions(id),
  metadata_standard text not null default 'PET-20' check (metadata_standard='PET-20'),
  metadata_version text not null default '1.0.0',
  denomination text not null check (denomination in ('kWh','MWh')),
  metadata jsonb not null,
  metadata_digest text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists energy_rwa_tenant_org_idx on energy_rwa_assets(tenant_id, organization_id, updated_at desc);

create table if not exists reward_epochs (
  id text primary key,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  state text not null,
  reward_pool_pwrc_base_units numeric(38,0) not null check (reward_pool_pwrc_base_units >= 0),
  contribution_root text,
  allocation_root text,
  created_at timestamptz not null default now()
);
create table if not exists reward_contributions (
  id text primary key,
  epoch_id text not null references reward_epochs(id),
  tenant_id text not null,
  participant_id text not null,
  category text not null,
  verified_wh bigint,
  quality_score_ppm bigint not null,
  reliability_score_ppm bigint not null,
  weight_ppm bigint not null,
  created_at timestamptz not null default now()
);
create table if not exists reward_allocations (
  epoch_id text not null references reward_epochs(id),
  participant_id text not null,
  pwrc_base_units numeric(38,0) not null,
  score numeric(38,0) not null,
  claimed_at timestamptz,
  claim_reference text,
  primary key(epoch_id, participant_id)
);

create table if not exists saas_tenants (
  id text primary key,
  organization_id text not null,
  name text not null,
  plan_id text not null check (plan_id in ('COMMUNITY','PRO','GRID_OPERATOR','ENTERPRISE')),
  state text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);
create table if not exists saas_tenant_members (
  tenant_id text not null references saas_tenants(id),
  actor_id text not null,
  role text not null,
  participant_type text,
  created_at timestamptz not null default now(),
  primary key(tenant_id,actor_id)
);
create table if not exists saas_api_keys (
  id text primary key,
  tenant_id text not null references saas_tenants(id),
  name text not null,
  key_prefix text not null,
  secret_hash text not null,
  scopes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);
create table if not exists saas_api_usage (
  tenant_id text not null,
  metric text not null,
  period text not null,
  used bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key(tenant_id,metric,period)
);
create table if not exists saas_audit_events (
  id text primary key,
  tenant_id text,
  actor_id text,
  action text not null,
  resource_type text not null,
  resource_id text,
  request_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists safe_action_idempotency (
  tenant_id text not null,
  idempotency_key text not null,
  action text not null,
  request_hash text,
  response jsonb,
  state text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  primary key(tenant_id,idempotency_key)
);

create table if not exists market_rate_snapshots (
  id bigserial primary key,
  base_asset text not null,
  quote_asset text not null,
  rate_decimal text not null,
  provider text not null,
  provider_reference text,
  observed_at timestamptz not null,
  received_at timestamptz not null default now(),
  state text not null
);
create index if not exists market_rate_pair_time_idx on market_rate_snapshots(base_asset,quote_asset,observed_at desc);

commit;
