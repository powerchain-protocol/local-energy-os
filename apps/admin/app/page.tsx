"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import { ActionCard, EmptyState, InlineNotice, PageHeader, Panel, StatCard, StatusBadge } from "@powerchain/ui";

type Service = { id: string; name: string; state: string; critical: boolean };
type Snapshot = {
  overall: string;
  generatedAt: string;
  runtime: { environment: string; operatingMode: string; dataMode: string; writeMode: string; network: string };
  services: Service[];
  management: { writesAllowed: boolean; settlementAllowed: boolean; marketMatchingAllowed: boolean; bridgeFinalizationAllowed: boolean; rewardsAllowed: boolean; reasons: string[] };
};

function tone(state?: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (state === "OPERATIONAL") return "success";
  if (["UNAVAILABLE", "MAINTENANCE"].includes(state ?? "")) return "danger";
  if (["DEGRADED", "DELAYED", "UNCONFIGURED"].includes(state ?? "")) return "warning";
  return "neutral";
}

export default function Page() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({})), [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    client.get<Snapshot>("/api/v1/system/status", controller.signal)
      .then(response => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "API unavailable");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client]);

  const services = data?.services ?? [];
  const operational = services.filter(service => service.state === "OPERATIONAL").length;
  const criticalAttention = services.filter(service => service.critical && service.state !== "OPERATIONAL");
  const allowedGates = data ? [data.management.writesAllowed, data.management.settlementAllowed, data.management.marketMatchingAllowed, data.management.bridgeFinalizationAllowed, data.management.rewardsAllowed].filter(Boolean).length : 0;

  return <main className="pc-page">
    <PageHeader
      eyebrow="Control Plane"
      title="Platform Administration"
      description="Operate PowerChain runtime health, execution policy, network configuration and tenant-safe infrastructure from one control surface."
      action={<StatusBadge tone={error ? "danger" : loading ? "neutral" : tone(data?.overall)}>{loading ? "Loading" : error ? "Unavailable" : data?.overall ?? "Connected"}</StatusBadge>}
    />

    {error ? <EmptyState icon="admin" title="Control plane unavailable" description={error} /> : <>
      <div className="pc-grid">
        <div className="pc-span-3"><StatCard icon="status" label="System state" value={loading ? "Loading" : data?.overall ?? "—"} meta={data ? `${operational}/${services.length} services operational` : "Waiting for runtime status"} status={data?.overall === "OPERATIONAL" ? "positive" : data ? "warning" : undefined} /></div>
        <div className="pc-span-3"><StatCard icon="shield" label="Execution gates" value={data ? `${allowedGates}/5` : "—"} meta="Writes, settlement, market, bridge, rewards" status={data && allowedGates === 5 ? "positive" : data ? "warning" : undefined} /></div>
        <div className="pc-span-3"><StatCard icon="warning" label="Critical attention" value={data ? criticalAttention.length : "—"} meta={criticalAttention.length ? criticalAttention.map(service => service.name).join(", ") : "No critical service restrictions"} status={criticalAttention.length ? "warning" : "positive"} /></div>
        <div className="pc-span-3"><StatCard icon="assets" label="Network" value={data?.runtime.network ?? "—"} meta={data ? `${data.runtime.environment} · ${data.runtime.operatingMode}` : "Runtime not loaded"} /></div>
      </div>

      {data?.management.reasons?.length ? <InlineNotice tone="warning" icon="warning" title="Managed restrictions active">{data.management.reasons.join(" · ")}</InlineNotice> : data ? <InlineNotice tone="success" icon="status" title="Control path available">No degraded-service reason is currently restricting managed execution.</InlineNotice> : null}

      <div className="pc-grid pc-admin-overview-grid">
        <Panel className="pc-span-8" eyebrow="Operations" title="System control plane" description="Move from status to configuration to execution policy without exposing secret runtime values.">
          <div className="pc-action-grid">
            <ActionCard icon="activity" title="System Status" description="Inspect service health, criticality, latency and deep connectivity probes." meta="Operational state" href="/system/status" />
            <ActionCard icon="settings" title="Runtime Config" description="Review sanitized environment, PostgreSQL, Redis, Solana and feature configuration." meta="No secrets exposed" href="/system/config" />
            <ActionCard icon="shield" title="Management Policies" description="See which writes, settlement, market, bridge and rewards actions are currently allowed." meta="Fail-closed gates" href="/system/management" />
            <ActionCard icon="api" title="API Contract" description="Use the canonical v1 contract for automation, integrations and operational clients." meta="/api/v1" />
          </div>
        </Panel>
        <Panel className="pc-span-4" eyebrow="Runtime" title="Current operating posture">
          {data ? <div className="pc-data-list">
            <div className="pc-data-row"><div><strong>Environment</strong><p>Deployment context used by safety policy.</p></div><span>{data.runtime.environment}</span></div>
            <div className="pc-data-row"><div><strong>Operating mode</strong><p>LIVE, READ_ONLY, SIMULATION or MAINTENANCE.</p></div><span>{data.runtime.operatingMode}</span></div>
            <div className="pc-data-row"><div><strong>Data mode</strong><p>Source truthfulness for operational projections.</p></div><span>{data.runtime.dataMode}</span></div>
            <div className="pc-data-row"><div><strong>Write mode</strong><p>Whether real economic mutations are permitted.</p></div><span>{data.runtime.writeMode}</span></div>
          </div> : <EmptyState icon="status" title="Loading runtime posture" description="Waiting for the canonical system status projection." />}
        </Panel>
      </div>
    </>}
  </main>;
}
