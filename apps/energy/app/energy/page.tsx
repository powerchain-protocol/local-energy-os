"use client";

import { formatEnergy } from "@powerchain/energy-core";
import { DataTable, DataValue, EmptyState, FilterPill, InlineNotice, PageHeader, Panel, Skeleton, StatCard, TableToolbar } from "@powerchain/ui";
import { useEnergyResource } from "../../components/use-energy-resource";

type Proof = { id: string; siteId: string; meterId: string; source: string; verifiedWh: string; intervalStart: string; intervalEnd: string; evidenceRoot: string };
type Batch = { id: string; proofId: string; source: string; verifiedWh: string; invalidatedWh: string; positionedWh: string; retiredWh: string; evidenceRoot: string; createdAt: string };

function energy(value: string | undefined) {
  try { return formatEnergy(BigInt(value ?? "0")); } catch { return { value: "—", unit: "" }; }
}
function total(items: Array<{ verifiedWh: string }> | undefined) { return (items ?? []).reduce((sum, item) => sum + BigInt(item.verifiedWh), 0n); }
function shortId(id: string) { return id.length > 14 ? `${id.slice(0, 7)}…${id.slice(-5)}` : id; }
function when(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? "—" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }

export default function EnergyPage() {
  const proofs = useEnergyResource<{ items: Proof[] }>("/api/v1/energy-proofs");
  const batches = useEnergyResource<{ items: Batch[] }>("/api/v1/energy-batches");
  const loading = proofs.loading || batches.loading;
  const error = proofs.error ?? batches.error;
  const verified = energy(total(batches.data?.items).toString());
  const positioned = energy((batches.data?.items ?? []).reduce((sum, item) => sum + BigInt(item.positionedWh), 0n).toString());
  const retired = energy((batches.data?.items ?? []).reduce((sum, item) => sum + BigInt(item.retiredWh), 0n).toString());

  return <main className="pc-page">
    <PageHeader eyebrow="Physical energy" title="Energy evidence" description="Trace meter-backed evidence into verified Energy Batches before any kWh or MWh Energy RWA becomes economically active." />
    {error ? <InlineNotice title="Energy evidence unavailable" tone="warning" icon="warning">{error}</InlineNotice> : null}
    <div className="pc-grid" style={{ marginTop: error ? 14 : 0 }}>
      <div className="pc-span-3"><StatCard icon="shield" label="Energy Proofs" value={loading ? "—" : proofs.data?.items.length ?? 0} meta="Validated evidence records" /></div>
      <div className="pc-span-3"><StatCard icon="energy" label="Verified supply" value={verified.value} unit={verified.unit} meta={`${batches.data?.items.length ?? 0} Energy Batches`} status="positive" /></div>
      <div className="pc-span-3"><StatCard icon="assets" label="Positioned" value={positioned.value} unit={positioned.unit} meta="Issued as Energy Positions" /></div>
      <div className="pc-span-3"><StatCard icon="status" label="Retired" value={retired.value} unit={retired.unit} meta="No longer circulating" /></div>

      <Panel className="pc-span-12" eyebrow="Energy ledger" title="Verified Energy Batches" description="Wh remains the canonical source-of-truth unit; kWh and MWh are display and market denominations only.">
        {loading ? <Skeleton lines={6}/> : <>
          <TableToolbar title="Recent batches" count={batches.data?.items.length ?? 0} description="Newest organization-scoped verified supply first."><FilterPill active>All sources</FilterPill><FilterPill>Verified</FilterPill></TableToolbar>
          <DataTable
            rows={batches.data?.items ?? []}
            rowKey={(row) => row.id}
            columns={[
              { key: "batch", header: "Batch", cell: (row) => <DataValue value={shortId(row.id)} meta={when(row.createdAt)} /> },
              { key: "source", header: "Source", cell: (row) => <DataValue value={row.source} meta={`Proof ${shortId(row.proofId)}`} /> },
              { key: "verified", header: "Verified", align: "right", cell: (row) => { const v = energy(row.verifiedWh); return <DataValue value={`${v.value} ${v.unit}`} meta="Physical backing"/>; } },
              { key: "positioned", header: "Positioned", align: "right", cell: (row) => { const v = energy(row.positionedWh); return <DataValue value={`${v.value} ${v.unit}`} meta="Economic positions"/>; } },
              { key: "retired", header: "Retired", align: "right", cell: (row) => { const v = energy(row.retiredWh); return <DataValue value={`${v.value} ${v.unit}`} meta="Final claims"/>; } },
              { key: "evidence", header: "Evidence", cell: (row) => <DataValue value={shortId(row.evidenceRoot)} meta="Evidence root"/> }
            ]}
            empty={<EmptyState icon="energy" title="No Energy Batches" description="Verified meter evidence has not yet been finalized into an Energy Batch for this organization."/>}
          />
        </>}
      </Panel>

      <Panel className="pc-span-12" eyebrow="Evidence" title="Recent Energy Proofs" description="Energy Proofs bind validated physical measurements to source, site, meter, time interval and evidence root.">
        {loading ? <Skeleton lines={5}/> : <DataTable
          rows={(proofs.data?.items ?? []).slice(0, 12)}
          rowKey={(row) => row.id}
          columns={[
            { key: "proof", header: "Proof", cell: (row) => <DataValue value={shortId(row.id)} meta={row.source}/> },
            { key: "site", header: "Site / Meter", cell: (row) => <DataValue value={shortId(row.siteId)} meta={shortId(row.meterId)}/> },
            { key: "verified", header: "Verified", align: "right", cell: (row) => { const v = energy(row.verifiedWh); return <DataValue value={`${v.value} ${v.unit}`}/>; } },
            { key: "interval", header: "Interval", cell: (row) => <DataValue value={when(row.intervalStart)} meta={`to ${when(row.intervalEnd)}`}/> },
            { key: "root", header: "Evidence root", cell: (row) => <DataValue value={shortId(row.evidenceRoot)}/> }
          ]}
          empty={<EmptyState icon="shield" title="No Energy Proofs" description="Connect validated metering evidence before issuing Energy Batches or Energy RWAs."/>}
        />}
      </Panel>
    </div>
  </main>;
}
