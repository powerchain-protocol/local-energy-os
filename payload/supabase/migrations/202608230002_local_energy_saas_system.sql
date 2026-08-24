begin;

alter table energy_batches add column if not exists invalidated_wh bigint not null default 0 check (invalidated_wh >= 0);

create table if not exists energy_participants (
  id text primary key,
  organization_id text,
  participant_type text not null check (participant_type in ('PROSUMER','CONSUMER','CLIENT','GRID_OPERATOR')),
  operator_role text,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists local_energy_workspaces (
  id text primary key,
  tenant_id text not null,
  organization_id text not null,
  context_type text not null check (context_type in ('HOUSEHOLD','COMMUNITY','COMPANY','CLIENT','GRID_OPERATOR','PORTFOLIO','VPP')),
  name text not null,
  grid_area_id text,
  created_at timestamptz not null default now()
);

create table if not exists saas_plans (
  id text primary key,
  name text not null,
  application_ids jsonb not null default '[]'::jsonb,
  feature_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists saas_subscriptions (
  id text primary key,
  tenant_id text not null,
  plan_id text not null references saas_plans(id),
  state text not null check (state in ('TRIAL','ACTIVE','PAST_DUE','SUSPENDED','CANCELLED')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists saas_entitlement_overrides (
  id text primary key,
  tenant_id text not null,
  organization_id text,
  workspace_id text,
  application_id text not null,
  feature_id text,
  allowed boolean not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists subsystem_health (
  subsystem text primary key,
  state text not null check (state in ('OPERATIONAL','DEGRADED','DELAYED','UNAVAILABLE','MAINTENANCE')),
  message text,
  observed_at timestamptz not null default now()
);

create table if not exists runtime_configuration_audit (
  id bigserial primary key,
  environment text not null,
  operating_mode text not null,
  data_mode text not null,
  write_mode text not null,
  network text not null,
  version text not null,
  validated boolean not null,
  created_at timestamptz not null default now()
);

commit;
