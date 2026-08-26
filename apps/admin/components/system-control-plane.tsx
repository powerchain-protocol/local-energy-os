"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import {
  DataTable,
  DataValue,
  EmptyState,
  InlineNotice,
  PageHeader,
  Panel,
  PowerChainIcon,
  StatCard,
  StatusBadge,
  type DataTableColumn,
  type PowerChainIconName,
} from "@powerchain/ui";

type ServiceRow = {
  id: string;
  name: string;
  state: string;
  configured: boolean;
  critical: boolean;
  observedAt: string;
  latencyMs?: number;
  message?: string;
};

type RuntimeStatus = {
  version: string;
  environment: string;
  operatingMode: string;
  dataMode: string;
  writeMode: string;
  network: string;
};

type ManagementStatus = {
  writesAllowed: boolean;
  settlementAllowed: boolean;
  marketMatchingAllowed: boolean;
  bridgeFinalizationAllowed: boolean;
  rewardsAllowed: boolean;
  reasons: string[];
};

type SystemStatusData = {
  overall: string;
  generatedAt: string;
  probe: "shallow" | "deep";
  runtime: RuntimeStatus;
  services: ServiceRow[];
  management: ManagementStatus;
};

type SystemConfigData = {
  version: string;
  environment: string;
  operatingMode: string;
  dataMode: string;
  writeMode: string;
  network: string;
  database: { configured: boolean; source: string; host?: string; port?: number; database?: string };
  redis: { configured: boolean; host?: string; port?: number };
  solana: {
    cluster: string;
    provider: string;
    rpcHost?: string;
    websocketHost?: string;
    energyRwaProgramConfigured: boolean;
    pwrcMintConfigured: boolean;
    heliusEnabled: boolean;
  };
  features: Record<string, boolean>;
};

type SystemManagementData = ManagementStatus & {
  operatingMode: string;
  writeMode: string;
  policies: Record<string, string>;
};

type SystemView = "status" | "config" | "management";
type SystemData = SystemStatusData | SystemConfigData | SystemManagementData;

const serviceIcons: Partial<Record<string, PowerChainIconName>> = {
  api: "api",
  database: "supply",
  redis: "activity",
  realtime: "activity",
  grpc: "api",
  telemetry: "devices",
  market: "market",
  settlement: "wallet",
  solana: "assets",
  sui: "assets",
  oracles: "activity",
  rewards: "treasury",
  storage: "supply",
};

function tone(state?: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (["OPERATIONAL", "LIVE", "enabled", "true"].includes(state ?? "")) return "success";
  if (["UNAVAILABLE", "MAINTENANCE", "disabled", "false"].includes(state ?? "")) return "danger";
  if (["DEGRADED", "DELAYED", "UNCONFIGURED", "SIMULATION", "simulated", "mock"].includes(state ?? "")) return "warning";
  if (["READ_ONLY", "devnet", "development"].includes(state ?? "")) return "info";
  return "neutral";
}

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

function timestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ControlButton({ children, onClick, active, disabled, icon }: { children: ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean; icon?: PowerChainIconName }) {
  return <button type="button" className={`pc-control-button ${active ? "is-active" : ""}`} onClick={onClick} disabled={disabled}>{icon ? <PowerChainIcon name={icon} /> : null}<span>{children}</span></button>;
}

function RuntimeStrip({ runtime }: { runtime: RuntimeStatus }) {
  const items = [
    ["Environment", runtime.environment, "settings"],
    ["Operating mode", runtime.operatingMode, "status"],
    ["Data mode", runtime.dataMode, "activity"],
    ["Write mode", runtime.writeMode, "shield"],
    ["Network", runtime.network, "assets"],
  ] as const;
  return <div className="pc-runtime-strip">{items.map(([label, value, icon]) => <div className="pc-runtime-item" key={label}><span className="pc-runtime-icon"><PowerChainIcon name={icon} /></span><div><small>{label}</small><strong>{pretty(value)}</strong></div><StatusBadge tone={tone(value)}>{value}</StatusBadge></div>)}</div>;
}

function GateCard({ label, allowed, description }: { label: string; allowed: boolean; description: string }) {
  return <div className={`pc-gate-card ${allowed ? "is-allowed" : "is-blocked"}`}><div className="pc-gate-head"><span className="pc-gate-icon"><PowerChainIcon name={allowed ? "status" : "shield"} /></span><StatusBadge tone={allowed ? "success" : "danger"}>{allowed ? "Allowed" : "Blocked"}</StatusBadge></div><strong>{label}</strong><p>{description}</p></div>;
}

function RawResponse({ data }: { data: SystemData }) {
  return <details className="pc-raw-details"><summary><span><PowerChainIcon name="api" />Raw sanitized response</span><small>Advanced diagnostics</small></summary><pre className="pc-code">{JSON.stringify(data, null, 2)}</pre></details>;
}

function StatusView({ data }: { data: SystemStatusData }) {
  const services = data.services ?? [];
  const operational = services.filter(service => service.state === "OPERATIONAL").length;
  const attention = services.filter(service => service.state !== "OPERATIONAL" && !["DISABLED", "UNKNOWN"].includes(service.state)).length;
  const critical = services.filter(service => service.critical && service.state !== "OPERATIONAL");
  const columns: DataTableColumn<ServiceRow>[] = [
    { key: "service", header: "Service", cell: row => <DataValue value={row.name} meta={row.message ?? row.id} /> },
    { key: "state", header: "State", cell: row => <StatusBadge tone={tone(row.state)}>{row.state}</StatusBadge> },
    { key: "configured", header: "Config", cell: row => row.configured ? "Configured" : "Not configured" },
    { key: "critical", header: "Role", cell: row => row.critical ? <strong>Critical</strong> : "Supporting" },
    { key: "latency", header: "Latency", align: "right", cell: row => typeof row.latencyMs === "number" ? `${row.latencyMs} ms` : "—" },
  ];

  return <>
    <RuntimeStrip runtime={data.runtime} />
    <div className="pc-grid pc-system-metrics">
      <div className="pc-span-3"><StatCard icon="status" label="Overall state" value={pretty(data.overall)} meta={`${operational}/${services.length || 0} services operational`} status={data.overall === "OPERATIONAL" ? "positive" : "warning"} /></div>
      <div className="pc-span-3"><StatCard icon="activity" label="Needs attention" value={attention} meta="Degraded, delayed or unavailable" status={attention ? "warning" : "positive"} /></div>
      <div className="pc-span-3"><StatCard icon="shield" label="Critical impact" value={critical.length} meta={critical.length ? "Execution policy may be restricted" : "No critical service impact"} status={critical.length ? "warning" : "positive"} /></div>
      <div className="pc-span-3"><StatCard icon="clock" label="Observed" value={timestamp(data.generatedAt)} meta={`${data.probe} probe · source timestamp`} /></div>
    </div>

    {critical.length ? <InlineNotice tone="warning" icon="warning" title="Critical service attention required">{critical.map(service => `${service.name}: ${service.state}`).join(" · ")}</InlineNotice> : <InlineNotice tone="success" icon="status" title="Critical path healthy">No critical service is currently reporting a blocking state.</InlineNotice>}

    <Panel eyebrow="Service health" title="Infrastructure matrix" description="Canonical subsystem state, configuration and observed latency. Operational state is never inferred from UI availability alone.">
      <div className="pc-service-grid">{services.map(service => <article className={`pc-service-card is-${tone(service.state)}`} key={service.id}><div className="pc-service-card-head"><span className="pc-service-icon"><PowerChainIcon name={serviceIcons[service.id] ?? "status"} /></span><StatusBadge tone={tone(service.state)}>{service.state}</StatusBadge></div><strong>{service.name}</strong><p>{service.message ?? (service.configured ? "Configured service boundary." : "Service is not configured for this runtime.")}</p><div className="pc-service-meta"><span>{service.critical ? "Critical" : "Supporting"}</span><span>{typeof service.latencyMs === "number" ? `${service.latencyMs} ms` : "No latency probe"}</span></div></article>)}</div>
    </Panel>

    <Panel eyebrow="Diagnostics" title="Service detail" description="Dense operational detail for incident triage and support workflows."><DataTable columns={columns} rows={services} rowKey={row => row.id} /></Panel>
  </>;
}

function ConfigView({ data }: { data: SystemConfigData }) {
  const runtime: RuntimeStatus = { version: data.version, environment: data.environment, operatingMode: data.operatingMode, dataMode: data.dataMode, writeMode: data.writeMode, network: data.network };
  const features = Object.entries(data.features ?? {});
  return <>
    <RuntimeStrip runtime={runtime} />
    <div className="pc-grid pc-system-config-grid">
      <Panel className="pc-span-4" eyebrow="Database" title="PostgreSQL"><div className="pc-kv-list"><div><span>Configured</span><strong>{data.database.configured ? "Yes" : "No"}</strong></div><div><span>Source</span><strong>{data.database.source}</strong></div><div><span>Host</span><strong>{data.database.host ?? "Not exposed"}</strong></div><div><span>Port</span><strong>{data.database.port ?? "—"}</strong></div><div><span>Database</span><strong>{data.database.database ?? "—"}</strong></div></div></Panel>
      <Panel className="pc-span-4" eyebrow="Realtime" title="Redis"><div className="pc-kv-list"><div><span>Configured</span><strong>{data.redis.configured ? "Yes" : "No"}</strong></div><div><span>Host</span><strong>{data.redis.host ?? "Not exposed"}</strong></div><div><span>Port</span><strong>{data.redis.port ?? "—"}</strong></div></div></Panel>
      <Panel className="pc-span-4" eyebrow="Settlement network" title="Solana"><div className="pc-kv-list"><div><span>Cluster</span><strong>{data.solana.cluster}</strong></div><div><span>Provider</span><strong>{data.solana.provider}</strong></div><div><span>RPC host</span><strong>{data.solana.rpcHost ?? "Not exposed"}</strong></div><div><span>WebSocket</span><strong>{data.solana.websocketHost ?? "Not exposed"}</strong></div><div><span>Energy RWA program</span><StatusBadge tone={data.solana.energyRwaProgramConfigured ? "success" : "warning"}>{data.solana.energyRwaProgramConfigured ? "Configured" : "Missing"}</StatusBadge></div><div><span>PWRC mint</span><StatusBadge tone={data.solana.pwrcMintConfigured ? "success" : "warning"}>{data.solana.pwrcMintConfigured ? "Configured" : "Missing"}</StatusBadge></div></div></Panel>
    </div>
    <Panel eyebrow="Feature gates" title="Runtime capabilities" description="Public feature state only. Credentials and secret-bearing URLs are intentionally omitted.">{features.length ? <div className="pc-feature-grid">{features.map(([name, enabled]) => <div className="pc-feature-row" key={name}><div><strong>{pretty(name)}</strong><small>{name}</small></div><StatusBadge tone={enabled ? "success" : "neutral"}>{enabled ? "Enabled" : "Disabled"}</StatusBadge></div>)}</div> : <EmptyState icon="settings" title="No feature flags reported" description="The runtime did not expose any public feature configuration." />}</Panel>
    <InlineNotice tone="info" icon="shield" title="Sanitized configuration">This screen intentionally excludes database passwords, API keys, Helius credentials, private RPC URLs and wallet signing material.</InlineNotice>
  </>;
}

function ManagementView({ data }: { data: SystemManagementData }) {
  const gates = [
    ["Economic writes", data.writesAllowed, "Creation and mutation of economically significant records."],
    ["Settlement", data.settlementAllowed, "Final financial and blockchain settlement execution."],
    ["Market matching", data.marketMatchingAllowed, "Creation of new local-energy matches and commitments."],
    ["Bridge finalization", data.bridgeFinalizationAllowed, "Completion of cross-chain settlement and representation changes."],
    ["Rewards", data.rewardsAllowed, "Reward epoch allocation, processing and claims."],
  ] as const;
  const policies = Object.entries(data.policies ?? {});
  return <>
    <div className="pc-runtime-strip is-compact"><div className="pc-runtime-item"><span className="pc-runtime-icon"><PowerChainIcon name="status" /></span><div><small>Operating mode</small><strong>{pretty(data.operatingMode)}</strong></div><StatusBadge tone={tone(data.operatingMode)}>{data.operatingMode}</StatusBadge></div><div className="pc-runtime-item"><span className="pc-runtime-icon"><PowerChainIcon name="shield" /></span><div><small>Write mode</small><strong>{pretty(data.writeMode)}</strong></div><StatusBadge tone={tone(data.writeMode)}>{data.writeMode}</StatusBadge></div></div>
    <div className="pc-gate-grid">{gates.map(([label, allowed, description]) => <GateCard key={label} label={label} allowed={allowed} description={description} />)}</div>
    {data.reasons?.length ? <InlineNotice tone="warning" icon="warning" title="Execution restrictions active">{data.reasons.map(pretty).join(" · ")}</InlineNotice> : <InlineNotice tone="success" icon="status" title="No runtime restrictions">No degraded-service reason is currently blocking a managed execution gate.</InlineNotice>}
    <Panel eyebrow="Fail-closed behavior" title="Degraded service policies" description="Service failures map to explicit operational behavior rather than silent fallback."><div className="pc-policy-list">{policies.map(([service, policy]) => <div className="pc-policy-row" key={service}><div><strong>{pretty(service)}</strong><small>Service boundary</small></div><code>{policy}</code></div>)}</div></Panel>
  </>;
}

export function SystemControlPlane({ view }: { view: SystemView }) {
  const [data, setData] = useState<SystemData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepProbe, setDeepProbe] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({})), [apiUrl]);

  const meta = view === "status"
    ? { title: "System Status", description: "Operational health across the PowerChain control plane, data plane and settlement rails.", endpoint: `/api/v1/system/status${deepProbe ? "?probe=deep" : ""}` }
    : view === "config"
      ? { title: "Runtime Configuration", description: "Sanitized runtime configuration for environment, data stores, settlement network and feature capabilities.", endpoint: "/api/v1/system/config" }
      : { title: "Management Policies", description: "Fail-closed execution gates derived from runtime mode and degraded-service state.", endpoint: "/api/v1/system/management" };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    client.get<SystemData>(meta.endpoint, controller.signal)
      .then(response => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "API unavailable");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, meta.endpoint, refresh]);

  const overall = view === "status" ? (data as SystemStatusData | null)?.overall : undefined;

  return <main className="pc-page pc-system-page">
    <PageHeader
      eyebrow="System Management"
      title={meta.title}
      description={meta.description}
      action={<>
        {view === "status" ? <ControlButton icon="activity" active={deepProbe} disabled={loading} onClick={() => setDeepProbe(value => !value)}>{deepProbe ? "Deep probe on" : "Deep probe"}</ControlButton> : null}
        <ControlButton icon="refresh" disabled={loading} onClick={() => setRefresh(value => value + 1)}>{loading ? "Refreshing" : "Refresh"}</ControlButton>
        <StatusBadge tone={error ? "danger" : loading ? "neutral" : tone(overall)}>{loading ? "Loading" : error ? "Unavailable" : overall ?? "Connected"}</StatusBadge>
      </>}
    />

    {error ? <EmptyState icon="status" title="System data unavailable" description={error} action={<ControlButton icon="refresh" onClick={() => setRefresh(value => value + 1)}>Retry</ControlButton>} /> : loading && !data ? <div className="pc-system-loading"><div className="pc-system-loading-bar"/><div className="pc-system-loading-grid">{Array.from({ length: 6 }, (_, index) => <span key={index}/>)}</div></div> : data ? <>
      {view === "status" ? <StatusView data={data as SystemStatusData} /> : null}
      {view === "config" ? <ConfigView data={data as SystemConfigData} /> : null}
      {view === "management" ? <ManagementView data={data as SystemManagementData} /> : null}
      <RawResponse data={data} />
    </> : null}
  </main>;
}
