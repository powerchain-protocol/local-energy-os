"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import { appCatalog } from "@powerchain/saas";
import { EmptyState, PageHeader, Panel, StatCard, StatusBadge } from "@powerchain/ui";

type Tenant = { organizationId: string; tenantId: string; plan: string; status: string; apps: string[]; subscriptions: Array<{ appId: string; enabled: boolean }> };

export default function Page() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID;
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({ organizationId })), [apiUrl, organizationId]);

  useEffect(() => {
    const controller = new AbortController();
    if (!organizationId) {
      setError("Set NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID to load tenant state.");
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    client.get<Tenant>(`/api/v1/saas/tenant/${encodeURIComponent(organizationId)}`, controller.signal)
      .then(result => { setTenant(result.data); setError(null); })
      .catch((cause: unknown) => setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "Tenant state unavailable"))
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, organizationId]);

  const entitled = tenant?.apps.length ?? 0;
  return <main className="pc-page">
    <PageHeader eyebrow="SaaS Control Plane" title="Platform" description="Tenant, subscription, application and entitlement management for the PowerChain product family." action={<StatusBadge tone={error ? "warning" : "success"}>{loading ? "Loading" : error ? "Unavailable" : tenant?.status ?? "Connected"}</StatusBadge>} />
    <div className="pc-grid">
      <div className="pc-span-3"><StatCard label="Plan" value={tenant?.plan ?? "—"} meta="Persisted SaaS subscription" /></div>
      <div className="pc-span-3"><StatCard label="Entitled apps" value={entitled || "—"} meta={`${appCatalog.length} applications in catalog`} /></div>
      <div className="pc-span-3"><StatCard label="Organization" value={organizationId ? "Scoped" : "—"} meta={organizationId ? "Tenant context resolved" : "Not configured"} status={organizationId ? "positive" : "warning"} /></div>
      <div className="pc-span-3"><StatCard label="Control plane" value="v1" meta="Entitlements are server-resolved" /></div>

      <Panel className="pc-span-8" eyebrow="Applications" title="PowerChain product entitlements">
        {error ? <EmptyState icon="assets" title="Tenant state unavailable" description={error} /> : <div className="platform-app-grid">{appCatalog.map(app => <div className="platform-app-card" key={app}><div><strong>{app}</strong><p>PowerChain application entitlement</p></div><StatusBadge tone={tenant?.apps.includes(app) ? "success" : "neutral"}>{tenant?.apps.includes(app) ? "Entitled" : "Not included"}</StatusBadge></div>)}</div>}
      </Panel>
      <Panel className="pc-span-4" eyebrow="Architecture" title="One platform, shared controls">
        <div className="pc-data-list"><div className="pc-data-row"><div><strong>Identity</strong><p>Account, wallet and organization membership remain separate.</p></div><span>Centralized</span></div><div className="pc-data-row"><div><strong>Entitlements</strong><p>Plan and app access resolve on the server.</p></div><span>Policy</span></div><div className="pc-data-row"><div><strong>UI</strong><p>Shared PowerChain shell with product-specific navigation.</p></div><span>Unified</span></div></div>
      </Panel>
    </div>
  </main>;
}
