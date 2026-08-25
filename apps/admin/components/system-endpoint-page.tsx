"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import { DataTable, EmptyState, PageHeader, Panel, StatCard, StatusBadge, type DataTableColumn } from "@powerchain/ui";

type ServiceRow = { id?: string; name?: string; state?: string; configured?: boolean; critical?: boolean; latencyMs?: number; message?: string };
type EndpointData = Record<string, unknown> & { overall?: string; generatedAt?: string; services?: ServiceRow[]; reasons?: string[] };

function tone(state?: string): "success" | "warning" | "danger" | "neutral" {
  if (state === "OPERATIONAL") return "success";
  if (["UNAVAILABLE", "MAINTENANCE"].includes(state ?? "")) return "danger";
  if (["DEGRADED", "DELAYED", "UNCONFIGURED"].includes(state ?? "")) return "warning";
  return "neutral";
}

export function SystemEndpointPage({ title, description, endpoint, eyebrow = "System Management" }: { title: string; description: string; endpoint: string; eyebrow?: string }) {
  const [data, setData] = useState<EndpointData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({})), [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    client.get<EndpointData>(endpoint, controller.signal)
      .then(response => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "API unavailable");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, endpoint]);

  const services = Array.isArray(data?.services) ? data.services : [];
  const columns: DataTableColumn<ServiceRow>[] = [
    { key: "service", header: "Service", cell: row => <strong>{row.name ?? row.id ?? "Unknown"}</strong> },
    { key: "state", header: "State", cell: row => <StatusBadge tone={tone(row.state)}>{row.state ?? "UNKNOWN"}</StatusBadge> },
    { key: "configured", header: "Configured", cell: row => row.configured === undefined ? "—" : row.configured ? "Yes" : "No" },
    { key: "critical", header: "Critical", cell: row => row.critical === undefined ? "—" : row.critical ? "Yes" : "No" },
    { key: "latency", header: "Latency", align: "right", cell: row => typeof row.latencyMs === "number" ? `${row.latencyMs} ms` : "—" },
  ];

  return <main className="pc-page">
    <PageHeader eyebrow={eyebrow} title={title} description={description} action={<StatusBadge tone={error ? "danger" : loading ? "neutral" : tone(data?.overall as string | undefined)}>{loading ? "Loading" : error ? "Unavailable" : String(data?.overall ?? "Ready")}</StatusBadge>} />
    {error ? <EmptyState icon="status" title="System data unavailable" description={error} /> : <div className="pc-grid">
      <div className="pc-span-3"><StatCard label="Endpoint" value="v1" meta={endpoint} /></div>
      <div className="pc-span-3"><StatCard label="Overall" value={loading ? "Loading" : String(data?.overall ?? "—")} meta="Canonical runtime projection" status={data?.overall === "OPERATIONAL" ? "positive" : data?.overall ? "warning" : undefined} /></div>
      <div className="pc-span-3"><StatCard label="Services" value={services.length || "—"} meta="Reported subsystem states" /></div>
      <div className="pc-span-3"><StatCard label="Generated" value={data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : "—"} meta="Source timestamp" /></div>
      {services.length ? <Panel className="pc-span-12" eyebrow="Subsystems" title="Operational state"><DataTable columns={columns} rows={services} rowKey={row => row.id ?? row.name ?? "service"} /></Panel> : null}
      <Panel className="pc-span-12" eyebrow="Canonical response" title="Sanitized system projection">
        <pre className="pc-code" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{loading ? "Loading…" : JSON.stringify(data, null, 2)}</pre>
      </Panel>
    </div>}
  </main>;
}
