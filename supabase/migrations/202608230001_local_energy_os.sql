begin;

create table if not exists energy_measurements (
  id text primary key,
  site_id text not null,
  meter_id text not null,
  interval_start timestamptz not null,
  interval_end timestamptz not null,
  import_wh bigint not null default 0 check (import_wh >= 0),
  export_wh bigint not null default 0 check (export_wh >= 0),
  source text,
  signature text,
  received_at timestamptz not null default now(),
  unique (meter_id, interval_start, interval_end)
);

create table if not exists energy_proofs (
  id text primary key,
  batch_id text not null,
  site_id text not null,
  meter_id text not null,
  source text not null,
  measured_wh bigint not null check (measured_wh >= 0),
  verified_wh bigint not null check (verified_wh >= 0 and verified_wh <= measured_wh),
  interval_start timestamptz not null,
  interval_end timestamptz not null,
  quality_score numeric(6,5) not null check (quality_score >= 0 and quality_score <= 1),
  evidence_root text not null,
  verifier text not null,
  verification_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists energy_batches (
  id text primary key,
  site_id text not null,
  grid_area_id text,
  source text not null,
  interval_start timestamptz not null,
  interval_end timestamptz not null,
  measured_wh bigint not null check (measured_wh >= 0),
  verified_wh bigint not null check (verified_wh >= 0 and verified_wh <= measured_wh),
  reserved_wh bigint not null default 0 check (reserved_wh >= 0),
  represented_wh bigint not null default 0 check (represented_wh >= 0),
  retired_wh bigint not null default 0 check (retired_wh >= 0),
  evidence_root text not null,
  state text not null,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  check (reserved_wh + represented_wh + retired_wh <= verified_wh)
);

create table if not exists energy_positions (
  id text primary key,
  energy_batch_id text not null references energy_batches(id),
  owner_id text not null,
  amount_wh bigint not null check (amount_wh > 0),
  source text not null,
  state text not null,
  grid_area_id text,
  connection_point_id text,
  interval_start timestamptz not null,
  interval_end timestamptz not null,
  evidence_root text not null,
  provenance_id text,
  created_at timestamptz not null default now()
);

create table if not exists energy_chain_representations (
  id text primary key,
  energy_position_id text not null references energy_positions(id),
  network text not null check (network in ('SOLANA','SUI')),
  reference text not null,
  amount_wh bigint not null check (amount_wh > 0),
  state text not null,
  created_at timestamptz not null default now(),
  unique (network, reference)
);


create table if not exists energy_reservations (
  id text primary key,
  energy_position_id text not null references energy_positions(id),
  order_id text,
  amount_wh bigint not null check (amount_wh > 0),
  state text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists energy_deliveries (
  id text primary key,
  trade_id text,
  energy_position_id text not null references energy_positions(id),
  committed_wh bigint not null check (committed_wh > 0),
  delivered_wh bigint check (delivered_wh >= 0),
  interval_start timestamptz not null,
  interval_end timestamptz not null,
  meter_evidence_root text,
  state text not null,
  created_at timestamptz not null default now()
);

create table if not exists energy_settlements (
  id text primary key,
  delivery_id text not null references energy_deliveries(id),
  gross_amount_base_units numeric(38,0) not null check (gross_amount_base_units >= 0),
  fee_amount_base_units numeric(38,0) not null default 0 check (fee_amount_base_units >= 0),
  asset text not null check (asset in ('EUR','EURC','USDC','PWRC')),
  network text,
  transaction_reference text,
  state text not null,
  reconciled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists energy_retirements (
  id text primary key,
  energy_position_id text not null references energy_positions(id),
  amount_wh bigint not null check (amount_wh > 0),
  reason text not null,
  receipt_reference text,
  retired_at timestamptz not null default now()
);


create table if not exists energy_orders (
  id text primary key,
  owner_id text not null,
  side text not null check (side in ('BUY','SELL')),
  amount_wh bigint not null check (amount_wh > 0),
  remaining_wh bigint not null check (remaining_wh >= 0),
  price_minor_per_kwh bigint not null check (price_minor_per_kwh >= 0),
  currency text not null check (currency in ('EUR','EURC','USDC','PWRC')),
  grid_area_id text not null,
  source_preference jsonb not null default '[]'::jsonb,
  state text not null default 'OPEN',
  created_at timestamptz not null default now()
);

create table if not exists energy_trades (
  id text primary key,
  seller_order_id text not null references energy_orders(id),
  buyer_order_id text not null references energy_orders(id),
  committed_wh bigint not null check (committed_wh > 0),
  delivered_wh bigint check (delivered_wh >= 0),
  price_minor_per_kwh bigint not null,
  currency text not null,
  grid_area_id text not null,
  state text not null,
  created_at timestamptz not null default now()
);

create table if not exists pwrc_bridge_positions (
  id text primary key,
  source_network text not null default 'SOLANA' check (source_network = 'SOLANA'),
  destination_network text not null default 'SUI' check (destination_network = 'SUI'),
  pwrc_amount_base_units numeric(38,0) not null check (pwrc_amount_base_units > 0),
  source_reference text,
  destination_reference text,
  state text not null,
  created_at timestamptz not null default now()
);

create index if not exists energy_measurements_meter_interval_idx
  on energy_measurements (meter_id, interval_start desc);
create index if not exists energy_batches_grid_interval_idx
  on energy_batches (grid_area_id, interval_start desc);
create index if not exists energy_positions_owner_state_idx
  on energy_positions (owner_id, state);
create index if not exists energy_orders_grid_state_idx
  on energy_orders (grid_area_id, state);

commit;
