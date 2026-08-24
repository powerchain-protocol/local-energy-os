"use client";
import { useCallback, useEffect, useState } from "react";
import { Activity, BatteryCharging, Factory, Gauge, RadioTower, RefreshCw, ShieldCheck, Wind, Zap } from "lucide-react";
import { Shell } from "@/components/shell";
import { fetchDigitalEnergyOverview } from "./api";
import type { DigitalEnergyOverviewPayload } from "./types";

function power(value?:string){if(!value)return"—";const w=BigInt(value);const abs=w<0n?-w:w;const sign=w<0n?"−":"";if(abs>=1_000_000n)return`${sign}${Number(abs)/1_000_000} MW`;if(abs>=1_000n)return`${sign}${Number(abs)/1_000} kW`;return`${w} W`}
function ppm(value?:string){return value?`${(Number(value)/10_000).toFixed(1)}%`:"—"}
const icons:Record<string,typeof Factory>={SOLAR_ARRAY:Zap,WIND_TURBINE:Wind,BATTERY:BatteryCharging,SMART_METER:Gauge,GRID_NODE:RadioTower,EVSE:Activity,PLANT:Factory};

export function DigitalTwinWorkspace(){
  const[data,setData]=useState<DigitalEnergyOverviewPayload|null>(null);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{setLoading(true);try{setData((await fetchDigitalEnergyOverview()).data);setError(null)}catch(cause){setError(cause instanceof Error?cause.message:"Digital Twin unavailable")}finally{setLoading(false)}},[]);
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),30_000);return()=>clearInterval(timer)},[load]);
  const operations=data?.operations;const summary=operations?.summary;
  return <Shell><div className="digital-twin-workspace">
    <header className="workspace-hero"><div><span className="eyebrow">Operational Digital Twin</span><h1>Physical infrastructure state</h1><p>Telemetry freshness, asset availability and operating context remain linked to physical sites. A Digital Twin is operational state and evidence—not a token, price feed or settlement record.</p></div><div className="workspace-hero-actions"><span>{data?.summary.dataMode??"CHECKING"}</span><button onClick={()=>void load()} disabled={loading}><RefreshCw className={loading?"animate-spin":""}/>Refresh</button></div></header>
    {error&&<div className="digital-energy-error"><ShieldCheck/><div><strong>Digital Twin unavailable</strong><span>{error}</span></div></div>}
    <section className="twin-metric-grid">
      <article><span>Tracked assets</span><strong>{summary?.twinAssets??0}</strong></article>
      <article><span>Stale telemetry</span><strong>{summary?.staleTwinAssets??0}</strong></article>
      <article><span>Offline assets</span><strong>{summary?.offlineTwinAssets??0}</strong></article>
      <article><span>Evidence model</span><strong>Physical-first</strong></article>
    </section>
    <section className="twin-grid">
      {(operations?.twins??[]).map(twin=>{const Icon=icons[twin.assetType]??Factory;return <article key={twin.id} className={`twin-card ${twin.state.toLowerCase()}`}><div><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-emerald-700"/><span className="eyebrow">{twin.assetType.replaceAll('_',' ')}</span></div><h3>{twin.label}</h3><p>{twin.siteId}{twin.gridAreaId?` · ${twin.gridAreaId}`:""}</p><dl><div><dt>State</dt><dd>{twin.state}</dd></div><div><dt>Freshness</dt><dd>{twin.freshness}</dd></div><div><dt>Power</dt><dd>{power(twin.powerW)}</dd></div><div><dt>Availability</dt><dd>{ppm(twin.availabilityPpm)}</dd></div>{twin.stateOfChargePpm&&<div><dt>State of charge</dt><dd>{ppm(twin.stateOfChargePpm)}</dd></div>}<div><dt>Telemetry age</dt><dd>{twin.telemetryAgeSeconds}s</dd></div></dl></div><span className={`twin-state ${twin.state.toLowerCase()}`} aria-label={twin.state}/></article>})}
      {!operations?.twins.length&&<article className="dashboard-panel"><p>No tenant Digital Twin assets loaded.</p></article>}
    </section>
    <section className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">Authority boundary</span><h2>What the twin can and cannot prove</h2></div><ShieldCheck className="h-5 w-5 text-emerald-700"/></div><div className="operations-principles"><span>Telemetry can describe physical state</span><span>Meter evidence can support delivery</span><span>Blockchain confirmation does not create energy</span><span>Financial settlement does not prove delivery</span></div></section>
  </div></Shell>
}
