-- Canonical tenant RLS bridge for PowerChain Local Energy OS v1.0.0.
-- The API still enforces policy server-side; these policies provide defense in depth
-- when a Supabase-authenticated client is permitted direct read access.

create or replace function public.powerchain_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.id from public.users u where u.supabase_user_id = auth.uid()::text limit 1
$$;

create or replace function public.powerchain_has_org(org_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = org_id and m.user_id = public.powerchain_user_id()
  )
$$;

alter table if exists organizations enable row level security;
alter table if exists participants enable row level security;
alter table if exists saas_tenants enable row level security;
alter table if exists energy_proofs enable row level security;
alter table if exists energy_batches enable row level security;
alter table if exists energy_positions enable row level security;
alter table if exists energy_reservations enable row level security;
alter table if exists energy_retirements enable row level security;
alter table if exists energy_chain_representations enable row level security;
alter table if exists energy_sites enable row level security;
alter table if exists meters enable row level security;
alter table if exists power_plants enable row level security;
alter table if exists wind_farms enable row level security;
alter table if exists charging_stations enable row level security;
alter table if exists charging_sessions enable row level security;
alter table if exists asset_passports enable row level security;

drop policy if exists organizations_member_select on organizations;
create policy organizations_member_select on organizations for select using (public.powerchain_has_org(id));

drop policy if exists participants_member_select on participants;
create policy participants_member_select on participants for select using (public.powerchain_has_org(organization_id));

drop policy if exists saas_tenants_member_select on saas_tenants;
create policy saas_tenants_member_select on saas_tenants for select using (public.powerchain_has_org(organization_id));

drop policy if exists energy_proofs_member_select on energy_proofs;
create policy energy_proofs_member_select on energy_proofs for select using (public.powerchain_has_org(organization_id));

drop policy if exists energy_batches_member_select on energy_batches;
create policy energy_batches_member_select on energy_batches for select using (public.powerchain_has_org(organization_id));

drop policy if exists energy_positions_member_select on energy_positions;
create policy energy_positions_member_select on energy_positions for select using (
  exists (select 1 from energy_batches b where b.id = energy_positions.batch_id and public.powerchain_has_org(b.organization_id))
);

drop policy if exists energy_reservations_member_select on energy_reservations;
create policy energy_reservations_member_select on energy_reservations for select using (
  exists (select 1 from energy_positions p join energy_batches b on b.id = p.batch_id where p.id = energy_reservations.position_id and public.powerchain_has_org(b.organization_id))
);

drop policy if exists energy_retirements_member_select on energy_retirements;
create policy energy_retirements_member_select on energy_retirements for select using (
  exists (select 1 from energy_positions p join energy_batches b on b.id = p.batch_id where p.id = energy_retirements.position_id and public.powerchain_has_org(b.organization_id))
);

drop policy if exists energy_representations_member_select on energy_chain_representations;
create policy energy_representations_member_select on energy_chain_representations for select using (
  exists (select 1 from energy_positions p join energy_batches b on b.id = p.batch_id where p.id = energy_chain_representations.position_id and public.powerchain_has_org(b.organization_id))
);

drop policy if exists energy_sites_member_select on energy_sites;
create policy energy_sites_member_select on energy_sites for select using (public.powerchain_has_org(organization_id));

drop policy if exists meters_member_select on meters;
create policy meters_member_select on meters for select using (
  exists (select 1 from energy_sites s where s.id = meters.site_id and public.powerchain_has_org(s.organization_id))
);

drop policy if exists power_plants_member_select on power_plants;
create policy power_plants_member_select on power_plants for select using (public.powerchain_has_org(organization_id));

drop policy if exists wind_farms_member_select on wind_farms;
create policy wind_farms_member_select on wind_farms for select using (public.powerchain_has_org(organization_id));

drop policy if exists charging_stations_member_select on charging_stations;
create policy charging_stations_member_select on charging_stations for select using (public.powerchain_has_org(organization_id));

drop policy if exists charging_sessions_member_select on charging_sessions;
create policy charging_sessions_member_select on charging_sessions for select using (
  exists (select 1 from charging_stations s where s.id = charging_sessions.station_id and public.powerchain_has_org(s.organization_id))
);

drop policy if exists asset_passports_member_select on asset_passports;
create policy asset_passports_member_select on asset_passports for select using (public.powerchain_has_org(organization_id));
