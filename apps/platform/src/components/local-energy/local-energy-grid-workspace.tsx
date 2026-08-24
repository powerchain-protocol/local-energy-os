"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, BatteryCharging, Grid3X3, Plus, RadioTower, RefreshCw, Zap } from "lucide-react";
import { energyCommunitySummary } from "@/data/p2p-energy";
import { kwhToWh, localEnergyBalance, whToKwh } from "@powerchain/local-energy";

type FlexSignal={
  id:string;
  gridAreaId:string;
  direction:"INCREASE_EXPORT"|"REDUCE_EXPORT"|"INCREASE_IMPORT"|"REDUCE_IMPORT";
  requestedWh:string;
  availableWh:string;
  state:string;
  startsAt:string;
  endsAt:string;
};

const feeders=[
  {name:"Helsinki Central F-12",state:"OPERATIONAL",load:72,headroom:"1.8 MW",signal:"NORMAL"},
  {name:"Espoo West F-07",state:"OPERATIONAL",load:84,headroom:"0.7 MW",signal:"REDUCE EXPORT"},
  {name:"Vantaa South F-03",state:"DEGRADED",load:91,headroom:"0.3 MW",signal:"REDUCE IMPORT"},
];

export function LocalEnergyGridWorkspace(){
  const[signals,setSignals]=useState<FlexSignal[]>([]);
  const[overview,setOverview]=useState<null|{community:{localSupplyWh:string|null;localDemandWh:string|null;matchedPercent:number|null;batteries:number|null};status:Record<string,string>}>(null);
  const[dataMode,setDataMode]=useState("DEMO");
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);
  const liveBalance=overview?.community.localSupplyWh!==null&&overview?.community.localSupplyWh!==undefined&&overview?.community.localDemandWh!==null&&overview?.community.localDemandWh!==undefined
    ? localEnergyBalance({supplyWh:BigInt(overview.community.localSupplyWh),demandWh:BigInt(overview.community.localDemandWh)})
    : null;
  const demoBalance=localEnergyBalance({supplyWh:kwhToWh(energyCommunitySummary.localSupplyKwh!),demandWh:kwhToWh(energyCommunitySummary.localDemandKwh!)});
  const balance=overview?liveBalance:demoBalance;

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const[flexResponse,overviewResponse]=await Promise.all([
        fetch("/api/v1/local-energy/flexibility",{cache:"no-store"}),
        fetch("/api/v1/local-energy/overview",{cache:"no-store"}),
      ]);
      const[body,overviewBody]=await Promise.all([flexResponse.json(),overviewResponse.json()]);
      if(!flexResponse.ok)throw new Error(body?.error?.message??"Flexibility signals unavailable");
      if(!overviewResponse.ok)throw new Error(overviewBody?.error?.message??"Local Energy overview unavailable");
      setSignals(body.data);
      setOverview(overviewBody.data);
      setDataMode(overviewBody?.meta?.dataMode??"DEMO");
      setError(null);
    }catch(cause){setError(cause instanceof Error?cause.message:"Flexibility signals unavailable")}
    finally{setLoading(false)}
  },[]);
  useEffect(()=>{void load()},[load]);

  async function createSignal(){
    const requestedKwh=Number(window.prompt("Requested flexibility in kWh","100")??"");
    const availableKwh=Number(window.prompt("Physically available flexibility in kWh","150")??"");
    if(!Number.isFinite(requestedKwh)||!Number.isFinite(availableKwh)||requestedKwh<=0||availableKwh<requestedKwh)return;
    const startsAt=new Date(Date.now()+15*60_000);
    const endsAt=new Date(startsAt.getTime()+60*60_000);
    try{
      const response=await fetch("/api/v1/local-energy/flexibility",{
        method:"POST",
        headers:{"content-type":"application/json","Idempotency-Key":`flex-${crypto.randomUUID()}`},
        body:JSON.stringify({
          gridAreaId:"grid-uusimaa",
          direction:"REDUCE_IMPORT",
          requestedKwh,
          availableKwh,
          startsAt:startsAt.toISOString(),
          endsAt:endsAt.toISOString(),
        }),
      });
      const body=await response.json();
      if(!response.ok)throw new Error(body?.error?.message??"Unable to create flexibility signal");
      await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Unable to create flexibility signal")}
  }

  return <div className="content-container space-y-6">
    <header className="local-energy-section-hero"><span className="eyebrow">LOCAL ENERGY · GRID & FLEXIBILITY · {dataMode}</span><h1>Coordinate DER assets inside real grid constraints.</h1><p>Local market commitments remain bounded by feeder, transformer and connection-point constraints. Flexibility requests cannot exceed physically available capacity.</p></header>
    {error&&<div className="digital-energy-error"><Activity/><div><strong>Grid notice</strong><span>{error}</span></div></div>}

    <section className="local-energy-metric-grid">
      <article><Grid3X3/><div><span>Community balance</span><strong>{balance?.state??"—"}</strong><small>{balance?`${Math.abs(whToKwh(balance.netWh)/1000).toFixed(2)} MWh net`:"Live telemetry unavailable"}</small></div></article>
      <article><BatteryCharging/><div><span>Batteries</span><strong>{overview?overview.community.batteries??"—":energyCommunitySummary.batteries}</strong><small>{overview&&overview.community.batteries===null?"Live aggregate unavailable":"Available for flexibility"}</small></div></article>
      <article><Zap/><div><span>Local match</span><strong>{overview?(overview.community.matchedPercent===null?"—":`${overview.community.matchedPercent}%`):`${energyCommunitySummary.matchedPercent}%`}</strong><small>{overview&&overview.community.matchedPercent===null?"Live aggregate unavailable":"Before upstream import/export"}</small></div></article>
      <article><RadioTower/><div><span>Open flex signals</span><strong>{signals.filter(item=>item.state==="OPEN").length}</strong><small>Tenant-scoped requests</small></div></article>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head"><div><span className="eyebrow">GRID OPERATING STATE</span><h2>Feeder constraints</h2></div><Activity className="h-5 w-5 text-emerald-700"/></div>
      <div className="local-energy-grid-list mt-4">{feeders.map(item=><article key={item.name}><div><strong>{item.name}</strong><span>{item.state}</span></div><dl><div><dt>Loading</dt><dd>{item.load}%</dd></div><div><dt>Headroom</dt><dd>{item.headroom}</dd></div><div><dt>Signal</dt><dd>{item.signal}</dd></div></dl></article>)}</div>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head">
        <div><span className="eyebrow">FLEXIBILITY REQUESTS</span><h2>Grid-aware dispatch signals</h2></div>
        <div className="flex gap-2"><button type="button" className="text-link" onClick={()=>void load()}><RefreshCw className={loading?"animate-spin":""}/>Refresh</button><button type="button" className="text-link" onClick={()=>void createSignal()}><Plus/>Create signal</button></div>
      </div>
      <div className="local-energy-flex-list mt-4">
        {signals.map(item=><article key={item.id}><div><span>{item.state}</span><strong>{item.direction.replaceAll("_"," ")}</strong><small>{item.gridAreaId}</small></div><dl><div><dt>Requested</dt><dd>{(Number(item.requestedWh)/1_000).toFixed(1)} kWh</dd></div><div><dt>Available</dt><dd>{(Number(item.availableWh)/1_000).toFixed(1)} kWh</dd></div><div><dt>Window</dt><dd>{new Date(item.startsAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}–{new Date(item.endsAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</dd></div></dl></article>)}
        {!signals.length&&!loading&&<div className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--muted)]">No flexibility requests are open.</div>}
      </div>
    </section>
  </div>;
}
