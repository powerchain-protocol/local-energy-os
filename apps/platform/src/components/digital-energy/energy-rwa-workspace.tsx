"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, CircleAlert, RefreshCw, ShieldCheck, UnlockKeyhole } from "lucide-react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { explorerUrl, fetchDigitalEnergyOverview, fetchDigitalEnergyPositionBacking, ppm, short, wh } from "./api";
import type { DigitalEnergyApiEnvelope, DigitalEnergyOverviewPayload, DigitalEnergyPositionBackingPayload } from "./types";

type DraftAction = {
  label:string;
  method:"POST";
  path:string;
  body:Record<string,string>;
  summary:string;
  preflightPositionId?:string;
}|null;

const idempotencyKey=()=>`digital-energy-${crypto.randomUUID()}`;

export function EnergyRwaWorkspace(){
  const[payload,setPayload]=useState<DigitalEnergyApiEnvelope<DigitalEnergyOverviewPayload>|null>(null);
  const[error,setError]=useState<string|null>(null);
  const[loading,setLoading]=useState(true);
  const[draft,setDraft]=useState<DraftAction>(null);
  const[executing,setExecuting]=useState(false);
  const[backing,setBacking]=useState<DigitalEnergyPositionBackingPayload|null>(null);
  const[preflightLoading,setPreflightLoading]=useState(false);

  const load=useCallback(async()=>{
    setLoading(true);
    try{setPayload(await fetchDigitalEnergyOverview());setError(null)}
    catch(cause){setError(cause instanceof Error?cause.message:"Unable to load Energy RWA")}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{void load()},[load]);

  useEffect(()=>{
    if(!draft?.preflightPositionId){setBacking(null);setPreflightLoading(false);return}
    const controller=new AbortController();
    setPreflightLoading(true);
    void fetchDigitalEnergyPositionBacking(draft.preflightPositionId,controller.signal)
      .then(result=>{setBacking(result.data);setError(null)})
      .catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:"Backing preflight failed")})
      .finally(()=>{if(!controller.signal.aborted)setPreflightLoading(false)});
    return()=>controller.abort();
  },[draft]);

  const data=payload?.data;
  const positions=data?.positions??[];
  const defaultPosition=positions[0]?.id??"";

  async function execute(){
    if(!draft)return;
    if(draft.preflightPositionId&&!backing){setError("Current backing must be resolved before execution");return}
    setExecuting(true);
    try{
      // Refresh backing immediately before the final economic write.
      if(draft.preflightPositionId)await fetchDigitalEnergyPositionBacking(draft.preflightPositionId);
      const response=await fetch(draft.path,{
        method:draft.method,
        headers:{"content-type":"application/json","Idempotency-Key":idempotencyKey()},
        body:JSON.stringify(draft.body),
      });
      const body=await response.json();
      if(!response.ok)throw new Error(body.error?.message??"Safe action failed");
      setDraft(null);setBacking(null);await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Safe action failed")}
    finally{setExecuting(false)}
  }

  return <Shell><div className="energy-rwa-workspace">
    <header className="workspace-hero dark">
      <div><span className="eyebrow">PET-20 · verified physical backing</span><h1>Energy RWA</h1><p>Issue, reserve, represent and retire verified Energy Positions without allowing digital economic state to exceed physical-energy backing.</p></div>
      <div className="workspace-hero-actions"><span>{data?.summary.dataMode??"CHECKING"} DATA</span><button onClick={()=>void load()} disabled={loading}><RefreshCw className={loading?"animate-spin":""}/>Refresh</button></div>
    </header>

    {error&&<div className="digital-energy-error"><CircleAlert/><div><strong>Action requires attention</strong><span>{error}</span></div></div>}

    <section className="rwa-metric-row">{[
      ["Verified",data?wh(data.summary.verifiedWh):"—"],
      ["Active RWA",data?wh(data.summary.activePositionWh):"—"],
      ["Reserved",data?wh(data.summary.reservedWh):"—"],
      ["Represented",data?wh(data.summary.representedWh):"—"],
      ["Coverage",data?ppm(data.summary.representationCoveragePpm):"—"],
    ].map(([label,value])=><article key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>

    <section className="rwa-work-grid">
      <article className="dashboard-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">Canonical ledger</span><h2>Energy Positions</h2></div><Link className="text-link" href="/asset-graph">Asset Graph <ArrowUpRight/></Link></div>
        <div className="digital-energy-table-wrap"><table className="digital-energy-table"><thead><tr><th>Position</th><th>Source</th><th>State</th><th>Canonical</th><th>Backing</th></tr></thead><tbody>
          {(data?.rwas??[]).map(rwa=>{
            const reserved=rwa.reservations.filter(x=>x.state==='ACTIVE').reduce((s,x)=>s+BigInt(x.amountWh),0n);
            const represented=rwa.representations.filter(x=>x.state!=='RETIRED').reduce((s,x)=>s+BigInt(x.amountWh),0n);
            return <tr key={rwa.id}><td><strong>{rwa.position.id}</strong><small>{rwa.position.energyBatchId}</small></td><td>{rwa.position.source}</td><td><span className="position-state">{rwa.position.state}</span></td><td>{wh(rwa.position.amountWh)}</td><td><span className="backing-line">{wh(reserved)} reserved · {wh(represented)} on-chain</span></td></tr>
          })}
        </tbody></table></div>
      </article>

      <article className="dashboard-panel safe-action-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">Review-first execution</span><h2>Safe action console</h2></div><ShieldCheck/></div>
        <SafeActionForms batches={data?.batches??[]} positions={positions.map(p=>p.id)} defaultPosition={defaultPosition} onDraft={setDraft}/>
        <p className="safe-action-note">Every economic write receives a fresh Idempotency-Key only at final execution. Reserve, represent and retire operations re-fetch current backing immediately before submission.</p>
      </article>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head"><div><span className="eyebrow">Reservations</span><h2>Active delivery / market reservations</h2></div></div>
      <div className="representation-grid">
        {(data?.rwas??[]).flatMap(rwa=>rwa.reservations.filter(res=>res.state==='ACTIVE').map(res=><article key={res.id} className="representation-card reservation"><div><span>RESERVATION</span><strong>{wh(res.amountWh)}</strong><small>{rwa.position.id} · {res.purpose}</small></div><div><span className="position-state">{res.state}</span><button type="button" className="representation-retire" onClick={()=>setDraft({label:"Release reservation",method:"POST",path:`/api/v1/digital-energy/reservations/${encodeURIComponent(res.id)}/release`,body:{},summary:`Release ${wh(res.amountWh)} reserved from ${rwa.position.id}.`})}><UnlockKeyhole/>Release</button></div></article>))}
        {!data?.rwas.some(rwa=>rwa.reservations.some(res=>res.state==='ACTIVE'))&&<p>No active reservations.</p>}
      </div>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head"><div><span className="eyebrow">Chain representations</span><h2>Solana + Sui allocations</h2></div></div>
      <div className="representation-grid">
        {(data?.rwas??[]).flatMap(rwa=>rwa.representations.map(rep=><article key={rep.id} className={`representation-card ${rep.network.toLowerCase()}`}><div><span>{rep.network}</span><strong>{wh(rep.amountWh)}</strong><small>{rwa.position.id}</small></div><div><span className="position-state">{rep.state}</span><code>{short(rep.reference)}</code><a href={explorerUrl(rep.network,rep.reference)} target="_blank" rel="noreferrer">{rep.network==='SOLANA'?'Solscan':'Suiscan'} <ArrowUpRight/></a>{rep.state!=='RETIRED'&&<button type="button" className="representation-retire" onClick={()=>setDraft({label:`Retire ${rep.network} representation`,method:"POST",path:`/api/v1/digital-energy/representations/${encodeURIComponent(rep.id)}/retire`,body:{},summary:`Retire ${wh(rep.amountWh)} representation ${rep.id}. Canonical backing remains in the Energy Position.`})}>Retire representation</button>}</div></article>))}
        {!data?.rwas.some(rwa=>rwa.representations.length)&&<p>No chain representations.</p>}
      </div>
    </section>

    {draft&&<div className="safe-review-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-label="Review Digital Energy action" className="safe-review-dialog">
      <div className="safe-review-icon"><ShieldCheck/></div><span className="eyebrow">Final review</span><h2>{draft.label}</h2><p>{draft.summary}</p>
      {draft.preflightPositionId&&<div className="backing-preflight"><span>Current canonical backing</span>{preflightLoading?<strong>Checking…</strong>:backing?<><strong>{wh(backing.canonicalPositionWh)} canonical · {wh(backing.availableWh)} available</strong><small>{wh(backing.activeReservedWh)} reserved · {wh(backing.activeRepresentedWh)} represented · {wh(backing.retiredWh)} retired · {backing.invariantState}</small></>:<strong>Backing unresolved</strong>}</div>}
      <dl>{Object.entries(draft.body).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||"—"}</dd></div>)}</dl>
      <div className="safe-review-actions"><button onClick={()=>{setDraft(null);setBacking(null)}} disabled={executing}>Cancel</button><button className="execute" onClick={()=>void execute()} disabled={executing||preflightLoading||Boolean(draft.preflightPositionId&&!backing)}>{executing?"Executing…":"Execute verified action"}<CheckCircle2/></button></div>
    </section></div>}
  </div></Shell>
}

function SafeActionForms({batches,positions,defaultPosition,onDraft}:{batches:DigitalEnergyOverviewPayload["batches"];positions:string[];defaultPosition:string;onDraft:(draft:DraftAction)=>void}){
  const[position,setPosition]=useState(defaultPosition);
  useEffect(()=>{if(!position&&defaultPosition)setPosition(defaultPosition)},[defaultPosition,position]);
  const[batchId,setBatchId]=useState(batches[0]?.id??"");
  useEffect(()=>{if(!batchId&&batches[0]?.id)setBatchId(batches[0].id)},[batchId,batches]);
  const[amount,setAmount]=useState("1000");
  const[network,setNetwork]=useState<"SOLANA"|"SUI">("SOLANA");
  const[reference,setReference]=useState("review-required-reference");

  const actions=useMemo(()=>[
    {label:"Create Energy Position",description:"Issue canonical Wh from a finalized verified Energy Batch.",disabled:!batchId,review:()=>onDraft({label:"Create Energy Position",method:"POST",path:"/api/v1/digital-energy/positions",body:{id:`ep_${crypto.randomUUID()}`,batchId,amountWh:amount},summary:`Issue ${amount} Wh from verified Energy Batch ${batchId}.`})},
    {label:"Reserve energy",description:"Reserve verified Wh for local-market or delivery commitment.",disabled:!position,review:()=>onDraft({label:"Reserve energy",method:"POST",path:`/api/v1/digital-energy/positions/${encodeURIComponent(position)}/reserve`,body:{reservationId:`res_${crypto.randomUUID()}`,amountWh:amount,purpose:"LOCAL_MARKET"},summary:`Reserve ${amount} Wh from ${position}.`,preflightPositionId:position})},
    {label:"Create chain representation",description:"Allocate canonical backing to one Solana or Sui PET-20 representation.",disabled:!position,review:()=>onDraft({label:`Create ${network} representation`,method:"POST",path:`/api/v1/digital-energy/positions/${encodeURIComponent(position)}/representations`,body:{representationId:`rep_${crypto.randomUUID()}`,network,reference,amountWh:amount},summary:`Represent ${amount} Wh from ${position} on ${network}.`,preflightPositionId:position})},
    {label:"Retire canonical position",description:"Only succeeds after active reservations and chain representations are cleared.",disabled:!position,review:()=>onDraft({label:"Retire canonical Energy Position",method:"POST",path:`/api/v1/digital-energy/positions/${encodeURIComponent(position)}/retire`,body:{retirementId:`ret_${crypto.randomUUID()}`,reason:"SETTLED"},summary:`Retire the remaining canonical backing of ${position}.`,preflightPositionId:position})},
  ],[amount,batchId,network,onDraft,position,reference]);

  return <div className="safe-action-forms">
    <label>Energy Batch<select value={batchId} onChange={event=>setBatchId(event.target.value)}>{batches.map(batch=><option key={batch.id} value={batch.id}>{batch.id} · {batch.source}</option>)}</select></label>
    <label>Energy Position<select value={position} onChange={event=>setPosition(event.target.value)}>{positions.map(id=><option key={id}>{id}</option>)}</select></label>
    <label>Amount Wh<input value={amount} onChange={event=>setAmount(event.target.value.replace(/\D/g,''))} inputMode="numeric"/></label>
    <label>Network<select value={network} onChange={event=>setNetwork(event.target.value as "SOLANA"|"SUI")}><option>SOLANA</option><option>SUI</option></select></label>
    <label>Representation reference<input value={reference} onChange={event=>setReference(event.target.value)}/></label>
    <div className="safe-action-buttons">{actions.map(action=><button key={action.label} type="button" onClick={action.review} disabled={action.disabled||!amount}><strong>{action.label}</strong><span>{action.description}</span></button>)}</div>
  </div>
}
