"use client";

import { formatEnergy } from "@powerchain/energy-core";
import { DataTable, DataValue, EmptyState, InlineNotice, PageHeader, Panel, Skeleton, StatusBadge, TableToolbar } from "@powerchain/ui";
import { useEnergyResource } from "../../../components/use-energy-resource";

type Batch = { id:string; proofId:string; verifiedWh:string; invalidatedWh:string; positionedWh:string; retiredWh:string; source:string; evidenceRoot:string; createdAt:string; updatedAt:string };
function energy(v:string){ try{return formatEnergy(BigInt(v));}catch{return {value:"—",unit:""};}}
function short(v:string){return v.length>15?`${v.slice(0,7)}…${v.slice(-5)}`:v;}
function when(v:string){const d=new Date(v);return Number.isNaN(d.valueOf())?"—":d.toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});}

export default function GenerationPage(){
  const batches=useEnergyResource<{items:Batch[]}>("/api/v1/energy-batches");
  return <main className="pc-page ems-page">
    <PageHeader eyebrow="EMS · Generation" title="Generation" description="Live generation belongs to telemetry; this page currently exposes verified generation evidence without pretending cumulative energy is instantaneous power." action={<StatusBadge tone={batches.error?"warning":"info"}>VERIFIED ENERGY</StatusBadge>}/>
    <InlineNotice title="Evidence view, not SCADA" tone="info" icon="shield">Energy Batches prove verified physical-energy quantities in Wh. Connect inverter/SCADA/meter telemetry to add current kW/MW, availability, curtailment and device-state views.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-12" eyebrow="Verified generation" title="Energy batches" description="Settlement-grade evidence grouped by source with immutable evidence roots.">
        {batches.loading?<Skeleton lines={6}/>:<><TableToolbar title="Generation evidence" count={batches.data?.items.length??0} description="Created from verified Energy Proofs."/><DataTable rows={batches.data?.items??[]} rowKey={r=>r.id} columns={[
          {key:"batch",header:"Batch",cell:r=><DataValue value={short(r.id)} meta={`Proof ${short(r.proofId)}`}/>},
          {key:"source",header:"Source",cell:r=><DataValue value={r.source} meta="Physical source classification"/>},
          {key:"verified",header:"Verified",align:"right",cell:r=>{const v=energy(r.verifiedWh);return <DataValue value={`${v.value} ${v.unit}`} meta="Settlement-grade energy"/>;}},
          {key:"positioned",header:"Positioned",align:"right",cell:r=>{const v=energy(r.positionedWh);return <DataValue value={`${v.value} ${v.unit}`}/>;}},
          {key:"retired",header:"Retired",align:"right",cell:r=>{const v=energy(r.retiredWh);return <DataValue value={`${v.value} ${v.unit}`}/>;}},
          {key:"evidence",header:"Evidence",cell:r=><DataValue value={short(r.evidenceRoot)} meta="Evidence commitment"/>},
          {key:"created",header:"Created",cell:r=><DataValue value={when(r.createdAt)}/>},
        ]} empty={<EmptyState icon="generation" title="No verified generation batches" description="Generation appears here after meter/device evidence is validated into an Energy Proof and finalized as an Energy Batch."/>}/></>}
      </Panel>
    </div>
  </main>;
}
