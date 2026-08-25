"use client";

import { formatEnergy } from "@powerchain/energy-core";
import { DataTable, DataValue, EmptyState, FilterPill, InlineNotice, PageHeader, Panel, Skeleton, StatCard, TableToolbar } from "@powerchain/ui";
import { useEnergyResource } from "../../components/use-energy-resource";

type Position = { id: string; batchId: string; unit: "KWH" | "MWH"; amountWh: string; reservedWh: string; retiredWh: string; state: string; canonicalChain: string; createdAt: string; batch?: { source?: string; evidenceRoot?: string } };
type Reservation = { id: string; positionId: string; amountWh: string; orderId?: string | null; createdAt: string };
type Retirement = { id: string; positionId: string; amountWh: string; reason: string; settlementId?: string | null; retiredAt: string };
function energy(value: string | undefined) { try { return formatEnergy(BigInt(value ?? "0")); } catch { return { value: "—", unit: "" }; } }
function sum(items: Array<Record<string, string>> | undefined, key: string) { return (items ?? []).reduce((total, item) => total + BigInt(item[key] ?? "0"), 0n); }
function shortId(id: string) { return id.length > 14 ? `${id.slice(0, 7)}…${id.slice(-5)}` : id; }
function when(value: string) { const date = new Date(value); return Number.isNaN(date.valueOf()) ? "—" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }

export default function AssetsPage() {
  const positions = useEnergyResource<{ items: Position[] }>("/api/v1/energy-positions");
  const reservations = useEnergyResource<{ items: Reservation[] }>("/api/v1/energy-reservations");
  const retirements = useEnergyResource<{ items: Retirement[] }>("/api/v1/energy-retirements");
  const loading = positions.loading || reservations.loading || retirements.loading;
  const error = positions.error ?? reservations.error ?? retirements.error;
  const totalPosition = energy(sum(positions.data?.items as unknown as Array<Record<string,string>>, "amountWh").toString());
  const reserved = energy(sum(positions.data?.items as unknown as Array<Record<string,string>>, "reservedWh").toString());
  const retired = energy(sum(positions.data?.items as unknown as Array<Record<string,string>>, "retiredWh").toString());
  const availableWh = (positions.data?.items ?? []).reduce((total, item) => total + BigInt(item.amountWh) - BigInt(item.reservedWh) - BigInt(item.retiredWh), 0n);
  const available = energy(availableWh.toString());

  return <main className="pc-page">
    <PageHeader eyebrow="Energy RWA" title="Verified energy assets" description="Manage kWh and MWh Energy Positions without mixing physical-energy backing with PWRC, wPWRC or financial settlement balances." />
    {error ? <InlineNotice title="Energy RWA data unavailable" tone="warning" icon="warning">{error}</InlineNotice> : null}
    <div className="pc-grid" style={{ marginTop: error ? 14 : 0 }}>
      <div className="pc-span-3"><StatCard icon="assets" label="Positioned energy" value={totalPosition.value} unit={totalPosition.unit} meta={`${positions.data?.items.length ?? 0} Energy Positions`} status="positive"/></div>
      <div className="pc-span-3"><StatCard icon="energy" label="Available" value={available.value} unit={available.unit} meta="Unreserved, unretired quantity" status="positive"/></div>
      <div className="pc-span-3"><StatCard icon="market" label="Reserved" value={reserved.value} unit={reserved.unit} meta={`${reservations.data?.items.length ?? 0} reservations`}/></div>
      <div className="pc-span-3"><StatCard icon="status" label="Retired" value={retired.value} unit={retired.unit} meta={`${retirements.data?.items.length ?? 0} retirement records`}/></div>

      <Panel className="pc-span-12" eyebrow="Positions" title="Energy RWA inventory" description="Every position traces back to a verified Energy Batch and remains bounded by canonical Wh supply.">
        {loading ? <Skeleton lines={6}/> : <>
          <TableToolbar title="Energy Positions" count={positions.data?.items.length ?? 0} description="kWh and MWh are denominations; amountWh remains authoritative."><FilterPill active>All</FilterPill><FilterPill>kWh</FilterPill><FilterPill>MWh</FilterPill></TableToolbar>
          <DataTable
            rows={positions.data?.items ?? []}
            rowKey={(row) => row.id}
            columns={[
              { key: "position", header: "Position", cell: (row) => <DataValue value={shortId(row.id)} meta={`Batch ${shortId(row.batchId)}`}/> },
              { key: "source", header: "Source", cell: (row) => <DataValue value={row.batch?.source ?? "—"} meta={row.unit === "MWH" ? "Utility-scale denomination" : "Distributed denomination"}/> },
              { key: "quantity", header: "Quantity", align: "right", cell: (row) => { const v=energy(row.amountWh); return <DataValue value={`${v.value} ${v.unit}`} meta={`${row.unit} RWA`}/>; } },
              { key: "reserved", header: "Reserved", align: "right", cell: (row) => { const v=energy(row.reservedWh); return <DataValue value={`${v.value} ${v.unit}`}/>; } },
              { key: "retired", header: "Retired", align: "right", cell: (row) => { const v=energy(row.retiredWh); return <DataValue value={`${v.value} ${v.unit}`}/>; } },
              { key: "state", header: "State", cell: (row) => <DataValue value={row.state} meta={row.canonicalChain}/> },
              { key: "created", header: "Created", cell: (row) => <DataValue value={when(row.createdAt)}/> }
            ]}
            empty={<EmptyState icon="assets" title="No Energy Positions" description="Issue an Energy Position only after verified physical-energy backing exists in an Energy Batch."/>}
          />
        </>}
      </Panel>

      <Panel className="pc-span-6" eyebrow="Reservations" title="Locked energy" description="Reservations prevent the same physical supply from supporting multiple economic commitments.">
        {loading ? <Skeleton lines={4}/> : <DataTable rows={(reservations.data?.items ?? []).slice(0,8)} rowKey={(row)=>row.id} columns={[
          { key:"position", header:"Position", cell:(row)=><DataValue value={shortId(row.positionId)} meta={row.orderId ? `Order ${shortId(row.orderId)}` : "No order reference"}/> },
          { key:"quantity", header:"Quantity", align:"right", cell:(row)=>{const v=energy(row.amountWh); return <DataValue value={`${v.value} ${v.unit}`}/>;} },
          { key:"created", header:"Created", cell:(row)=><DataValue value={when(row.createdAt)}/> }
        ]} empty={<EmptyState icon="market" title="No active reservations" description="Energy remains available until a market, delivery or settlement workflow reserves it."/>}/>}
      </Panel>

      <Panel className="pc-span-6" eyebrow="Retirement" title="Final energy claims" description="Retired quantities cannot return to circulating inventory without an explicit corrective process.">
        {loading ? <Skeleton lines={4}/> : <DataTable rows={(retirements.data?.items ?? []).slice(0,8)} rowKey={(row)=>row.id} columns={[
          { key:"position", header:"Position", cell:(row)=><DataValue value={shortId(row.positionId)} meta={row.reason}/> },
          { key:"quantity", header:"Quantity", align:"right", cell:(row)=>{const v=energy(row.amountWh); return <DataValue value={`${v.value} ${v.unit}`}/>;} },
          { key:"retired", header:"Retired", cell:(row)=><DataValue value={when(row.retiredAt)} meta={row.settlementId ? `Settlement ${shortId(row.settlementId)}` : "No settlement reference"}/> }
        ]} empty={<EmptyState icon="status" title="No retired energy" description="Retirement records appear after final consumption, settlement or another approved retirement reason."/>}/>}
      </Panel>
    </div>
  </main>;
}
