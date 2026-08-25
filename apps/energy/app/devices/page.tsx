"use client";

import { EmptyState, InlineNotice, PageHeader, Panel, Skeleton, StatCard, StatusBadge } from "@powerchain/ui";
import { useEnergyResource } from "../../components/use-energy-resource";

type Health = { overall: string; services: Record<string,string>; runtime: { operatingMode: string; dataMode: string; network: string } };

export default function DevicesPage() {
  const health = useEnergyResource<Health>("/api/v1/system/health");
  const services = health.data?.services ?? {};
  return <main className="pc-page">
    <PageHeader eyebrow="DePIN / IoT" title="Connected infrastructure" description="Device identity, smart meters, gateways and industrial telemetry belong to the physical evidence plane—not the token ledger." action={<StatusBadge tone={health.data?.overall === "OPERATIONAL" ? "success" : health.error ? "warning" : "info"}>{health.loading ? "Checking services" : health.data?.overall ?? "Unconfigured"}</StatusBadge>}/>
    {health.error ? <InlineNotice title="Service health unavailable" tone="warning" icon="warning">{health.error}</InlineNotice> : null}
    <div className="pc-grid" style={{ marginTop: health.error ? 14 : 0 }}>
      <div className="pc-span-3"><StatCard icon="devices" label="Device inventory" value="—" meta="Inventory endpoint not configured"/></div>
      <div className="pc-span-3"><StatCard icon="activity" label="Telemetry mode" value={health.data?.runtime.dataMode ?? "—"} meta="Source identity"/></div>
      <div className="pc-span-3"><StatCard icon="api" label="API" value={services.api ?? "—"} meta="Control-plane availability" status={services.api === "OPERATIONAL" ? "positive" : "warning"}/></div>
      <div className="pc-span-3"><StatCard icon="shield" label="Database" value={services.database ?? "—"} meta="Canonical operational state" status={services.database === "OPERATIONAL" ? "positive" : "warning"}/></div>

      <Panel className="pc-span-8" eyebrow="Infrastructure inventory" title="Meters, devices and gateways" description="A canonical device inventory API is intentionally required before this view presents equipment as connected.">
        {health.loading ? <Skeleton lines={5}/> : <EmptyState icon="devices" title="Device inventory is not exposed yet" description="Add the organization-scoped /api/v1/meters and /api/v1/devices inventory surfaces before presenting physical equipment here. Telemetry evidence must remain authenticated, validated and freshness-aware."/>}
      </Panel>
      <Panel className="pc-span-4" eyebrow="Evidence path" title="Physical data boundary" description="Signed telemetry is evidence, not automatic economic authority.">
        <div className="pc-data-list">
          <div className="pc-data-row"><div><strong>1. Device identity</strong><p>Certificate / key / gateway identity</p></div><span>Required</span></div>
          <div className="pc-data-row"><div><strong>2. Telemetry validation</strong><p>Schema, sequence, timestamp, plausibility</p></div><span>Required</span></div>
          <div className="pc-data-row"><div><strong>3. Energy interval</strong><p>Normalized canonical Wh</p></div><span>Required</span></div>
          <div className="pc-data-row"><div><strong>4. Energy Proof</strong><p>Evidence root + verification policy</p></div><span>Economic gate</span></div>
        </div>
      </Panel>
    </div>
  </main>;
}
