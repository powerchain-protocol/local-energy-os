"use client";

import { useEffect, useMemo, useState } from "react";
import { PowerChainApiClient, PowerChainApiError, resolveApiBaseUrl } from "@powerchain/api-client";
import { formatEnergy } from "@powerchain/energy-core";
import { ActionCard, InlineNotice, LifecycleStep, PageHeader, Panel, ProgressBar, Skeleton, StatCard, StatusBadge } from "@powerchain/ui";
import { useEnergyContext } from "../components/context-provider";

type CommandCenter = {
  context: { organizationId: string };
  runtime: { environment: string; operatingMode: string; dataMode: string; writeMode: string; network: string };
  energyLedger: { batchCount: number; verifiedWh: string; invalidatedWh: string; positionedWh: string; retiredWh: string; availableVerifiedWh: string };
  rwa: { positionCount: number; activeOperations: number; totalPositionWh: string; reservedWh: string; retiredWh: string };
  participants: { prosumers: number; consumers: number; clients: number; gridOperators: number };
  pwrc: { canonicalChain: "SOLANA"; wrappedChain: "SUI"; balanceSource: string; note: string };
};

function energy(value: string | undefined) {
  if (!value) return { value: "—", unit: "" };
  try { return formatEnergy(BigInt(value)); } catch { return { value: "—", unit: "" }; }
}

function ratio(part: string | undefined, total: string | undefined) {
  try {
    const p = BigInt(part ?? "0");
    const t = BigInt(total ?? "0");
    if (t <= 0n) return 0;
    return Number((p * 10_000n) / t) / 100;
  } catch { return 0; }
}

export default function Page() {
  const { context } = useEnergyContext();
  const [data, setData] = useState<CommandCenter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const organizationId = process.env.NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID;
  const apiUrl = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL, process.env.NODE_ENV);
  const client = useMemo(() => new PowerChainApiClient(apiUrl, () => ({ organizationId, contextType: context.type })), [apiUrl, organizationId, context.type]);

  useEffect(() => {
    const controller = new AbortController();
    if (!organizationId) {
      setData(null);
      setError("Set NEXT_PUBLIC_DEFAULT_ORGANIZATION_ID to connect this workspace to tenant data.");
      setLoading(false);
      return () => controller.abort();
    }
    setLoading(true);
    setError(null);
    client.get<CommandCenter>("/api/v1/energy/command-center", controller.signal)
      .then(response => setData(response.data))
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setData(null);
        setError(cause instanceof PowerChainApiError ? `${cause.code}: ${cause.message}` : "Command Center data is unavailable.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [client, organizationId]);

  const verified = energy(data?.energyLedger.verifiedWh);
  const available = energy(data?.energyLedger.availableVerifiedWh);
  const positioned = energy(data?.energyLedger.positionedWh);
  const reserved = energy(data?.rwa.reservedWh);
  const retired = energy(data?.rwa.retiredWh);
  const participantCount = (data?.participants.prosumers ?? 0) + (data?.participants.consumers ?? 0) + (data?.participants.clients ?? 0) + (data?.participants.gridOperators ?? 0);
  const positionPct = ratio(data?.energyLedger.positionedWh, data?.energyLedger.verifiedWh);
  const retirementPct = ratio(data?.rwa.retiredWh, data?.energyLedger.verifiedWh);

  return <main className="pc-page">
    <PageHeader
      eyebrow="Energy Command Center"
      title={context.label}
      description="Physical energy, verified RWA supply, participant scope and operational state—without mixing energy quantities with token or payment balances."
      action={<><StatusBadge tone={error ? "warning" : "success"}>{loading ? "Refreshing" : error ? "Data unavailable" : "API connected"}</StatusBadge>{data?.runtime.operatingMode ? <StatusBadge tone={data.runtime.operatingMode === "LIVE" ? "success" : "info"}>{data.runtime.operatingMode}</StatusBadge> : null}</>}
    />

    {error ? <InlineNotice title="Workspace configuration required" tone="warning" icon="warning">{error}</InlineNotice> : null}

    <div className="pc-grid" style={{ marginTop: error ? 14 : 0 }}>
      <div className="pc-span-3"><StatCard icon="energy" label="Verified physical energy" value={verified.value} unit={verified.unit} meta={`${data?.energyLedger.batchCount ?? 0} finalized / active batches`} status="positive" /></div>
      <div className="pc-span-3"><StatCard icon="assets" label="Available backing" value={available.value} unit={available.unit} meta="Verified supply not yet positioned" status="positive" /></div>
      <div className="pc-span-3"><StatCard icon="market" label="Reserved energy" value={reserved.value} unit={reserved.unit} meta={`${data?.rwa.activeOperations ?? 0} active economic operations`} /></div>
      <div className="pc-span-3"><StatCard icon="status" label="Retired energy" value={retired.value} unit={retired.unit} meta="Finalized physical-energy claims" /></div>

      <Panel className="pc-span-12" eyebrow="Energy lifecycle" title="Verified supply → economic position → reservation → retirement" description="The physical supply boundary remains authoritative through every economic state." action={<StatusBadge>Wh canonical</StatusBadge>}>
        {loading ? <Skeleton lines={4} /> : <div className="pc-lifecycle">
          <LifecycleStep icon="shield" label="Verified" value={verified.value} unit={verified.unit} state="complete" />
          <LifecycleStep icon="assets" label="Positioned" value={positioned.value} unit={positioned.unit} state={positionPct > 0 ? "active" : "muted"} />
          <LifecycleStep icon="market" label="Reserved" value={reserved.value} unit={reserved.unit} state={(data?.rwa.activeOperations ?? 0) > 0 ? "active" : "muted"} />
          <LifecycleStep icon="status" label="Retired" value={retired.value} unit={retired.unit} state={retirementPct > 0 ? "complete" : "muted"} />
        </div>}
        <div style={{ marginTop: 18 }}><ProgressBar value={positionPct} label="Share of verified supply positioned as Energy RWA" /></div>
      </Panel>

      <Panel className="pc-span-8" eyebrow="Asset model" title="Keep physical energy, network utility and settlement separate" description="PowerChain exposes blockchain rails when they are operationally relevant; they do not replace the physical ledger.">
        <div className="energy-boundary-grid">
          <div><span>ENERGY RWA</span><strong>kWh / MWh</strong><p>Verified physical-energy positions backed by canonical integer Wh.</p></div>
          <div><span>PWRC</span><strong>Native · Solana</strong><p>PowerChain utility and reward asset. Never treated as electricity.</p></div>
          <div><span>wPWRC</span><strong>1:1 · Sui</strong><p>Bridged PWRC representation with explicit backing and reconciliation.</p></div>
        </div>
        <p className="energy-note">{data?.pwrc.note ?? "PWRC wallet balances remain unavailable until a verified wallet/account source is configured."}</p>
      </Panel>

      <Panel className="pc-span-4" eyebrow="Participants" title={`${participantCount} in current scope`} description="Role and context determine aggregation, authorization and available actions.">
        {loading ? <Skeleton lines={4} /> : <div className="pc-data-list">
          <div className="pc-data-row"><div><strong>Prosumers</strong><p>Generate and consume energy</p></div><span>{data?.participants.prosumers ?? 0}</span></div>
          <div className="pc-data-row"><div><strong>Consumers</strong><p>Demand-side participants</p></div><span>{data?.participants.consumers ?? 0}</span></div>
          <div className="pc-data-row"><div><strong>Enterprise clients</strong><p>Commercial / institutional contexts</p></div><span>{data?.participants.clients ?? 0}</span></div>
          <div className="pc-data-row"><div><strong>Grid operators</strong><p>Grid-authority contexts</p></div><span>{data?.participants.gridOperators ?? 0}</span></div>
        </div>}
      </Panel>

      <Panel className="pc-span-12" eyebrow="Operational workspaces" title="Monitor → Plan & Operate → Context" description="The dashboard remains the overview entry. Move into the workspace that matches the operational question without mixing physical state, planning and contextual data.">
        <div className="pc-action-grid energy-workspace-grid">
          <ActionCard icon="activity" title="Monitor" description="Observe live physical state, verified generation evidence, demand and storage condition." meta="Source · timestamp · freshness" href="/monitor" />
          <ActionCard icon="dispatch" title="Plan & Operate" description="Forecast, assess flexibility, prepare dispatch intent and apply grid constraints." meta="Simulation · policy · approval" href="/operate" />
          <ActionCard icon="events" title="Context" description="Add market commitments and operational events without overriding physical truth." meta="Markets · events · external context" href="/context" />
        </div>
      </Panel>

      <Panel className="pc-span-8" eyebrow="Operations" title="Priority actions" description="Only actions supported by configured sources should become executable.">
        <div className="pc-action-grid">
          <ActionCard icon="shield" title="Review Energy RWA backing" description="Inspect verified batches, positioned supply and retirement state before market execution." meta={`${data?.rwa.positionCount ?? 0} positions`} />
          <ActionCard icon="activity" title="Review runtime safety" description="Confirm operating mode, data source and write mode before enabling economic mutations." meta={data ? `${data.runtime.dataMode} · ${data.runtime.writeMode}` : "Runtime unavailable"} />
          <ActionCard icon="wallet" title="Connect verified PWRC source" description="Expose balances only after a wallet/account source is authenticated and reconciled." meta={data?.pwrc.balanceSource ?? "Not configured"} />
          <ActionCard icon="grid" title="Validate grid context" description="Local energy eligibility must remain constrained by the electrical topology and tenant scope." meta={context.type} />
        </div>
      </Panel>

      <Panel className="pc-span-4" eyebrow="Runtime" title="Operational boundary" description="Visible runtime state prevents simulated or stale data from being mistaken for live state.">
        <div className="pc-data-list">
          <div className="pc-data-row"><div><strong>Environment</strong><p>Deployment boundary</p></div><span>{data?.runtime.environment ?? "—"}</span></div>
          <div className="pc-data-row"><div><strong>Data mode</strong><p>Source identity</p></div><span>{data?.runtime.dataMode ?? "—"}</span></div>
          <div className="pc-data-row"><div><strong>Write mode</strong><p>Mutation safety</p></div><span>{data?.runtime.writeMode ?? "—"}</span></div>
          <div className="pc-data-row"><div><strong>Network</strong><p>Settlement network</p></div><span>{data?.runtime.network ?? "—"}</span></div>
        </div>
      </Panel>
    </div>
  </main>;
}
