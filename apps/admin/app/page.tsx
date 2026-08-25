"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@powerchain/ui";

type ApiData = Record<string, unknown> & { items?: unknown[] };

export default function Page() {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID;
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({ organizationId })), [apiUrl, organizationId]);

  useEffect(() => {
    const controller = new AbortController();
    if (!organizationId && "admin" !== "admin" && "admin" !== "mapper" && "admin" !== "grid") {
      setError("Set NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID to load tenant-scoped data.");
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    setError(null);
    client.get<ApiData>("/api/v1/system/health", controller.signal)
      .then(response => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "API unavailable");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, organizationId]);

  const count = Array.isArray(data?.items) ? data.items.length : null;
  const fieldCount = data ? Object.keys(data).length : 0;

  return <main className="pc-page">
    <PageHeader
      eyebrow="System Management"
      title="Platform Administration"
      description="Operational administration for tenant security, integrations, audit and platform health."
      action={<StatusBadge tone={error ? "warning" : "success"}>{loading ? "Loading" : error ? "Unavailable" : "API connected"}</StatusBadge>}
    />
    <div className="pc-grid">
      <div className="pc-span-3"><StatCard label="Subsystem projection" value={count ?? (data ? fieldCount : "—")} meta={count === null ? "Canonical projection fields" : "Records in current scope"} /></div>
      <div className="pc-span-3"><StatCard label="Tenant context" value={organizationId ? "Scoped" : "—"} meta={organizationId ? "Organization header enabled" : "Organization not configured"} status={organizationId ? "positive" : "warning"} /></div>
      <div className="pc-span-3"><StatCard label="API contract" value="v1" meta="Canonical control-plane namespace" /></div>
      <div className="pc-span-3"><StatCard label="Data state" value={error ? "Degraded" : loading ? "Loading" : "Ready"} meta={error ? "No fabricated fallback data" : "Source identity preserved"} status={error ? "warning" : "positive"} /></div>

      <Panel className="pc-span-8" eyebrow="Operations" title="Canonical service boundary" action={<code className="pc-code">/api/v1/system/health</code>}>
        {error ? <EmptyState icon="admin" title="Data source unavailable" description={error} /> : loading ? <EmptyState icon="status" title="Loading operational state" description="The workspace is resolving tenant-scoped data from the canonical API." /> : <div className="pc-data-list"><div className="pc-data-row"><div><strong>Physical / operational source</strong><p>Administrative visibility never substitutes for server-side authorization.</p></div><span>Canonical</span></div><div className="pc-data-row"><div><strong>Tenant isolation</strong><p>Organization context is forwarded to API policy and repository boundaries.</p></div><span>{organizationId ? "Scoped" : "Unconfigured"}</span></div><div className="pc-data-row"><div><strong>Economic state</strong><p>Blockchain and settlement details remain secondary until an operation requires them.</p></div><span>Separated</span></div></div>}
      </Panel>
      <Panel className="pc-span-4" eyebrow="Design system" title="Infrastructure first">
        <div className="pc-data-list"><div className="pc-data-row"><div><strong>Visual language</strong><p>White, light gray, forest green and restrained status colors.</p></div><span>v1.0</span></div><div className="pc-data-row"><div><strong>Navigation</strong><p>Persistent full-height sidebar with no application footer.</p></div><span>Unified</span></div><div className="pc-data-row"><div><strong>Complexity</strong><p>Protocol rails are shown only when operationally relevant.</p></div><span>Progressive</span></div></div>
      </Panel>
    </div>
  </main>;
}
