create extension if not exists pgcrypto;
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create type asset_type as enum ('SOLAR','WIND','HYDRO','BATTERY','BIOMASS','GRID');
create type asset_status as enum ('ACTIVE','MAINTENANCE','OFFLINE','COMMISSIONING');
create table if not exists energy_assets (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade,
  name text not null, type asset_type not null, status asset_status not null default 'ACTIVE', capacity_mw numeric(12,3) not null,
  latitude numeric(9,6), longitude numeric(9,6), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists energy_assets_org_status_idx on energy_assets(organization_id, status);
