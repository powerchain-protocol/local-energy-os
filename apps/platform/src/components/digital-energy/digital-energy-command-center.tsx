"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowUpRight, Boxes, Cable, DatabaseZap, Factory, Gauge, Network, RefreshCw, Scale, ShieldCheck, WalletCards, Zap } from "lucide-react";
import { fetchDigitalEnergyOverview, ppm, short, wh } from "./api";
import type { DigitalEnergyApiEnvelope, DigitalEnergyOverviewPayload } from "./types";

function stateClass(state?:string){return String(state??"UNRESOLVED").toLowerCase().replaceAll("_","-")}
function powerW(value?:string){if(!value)return"—";const raw=BigInt(value);const sign=raw<0n?"−":"";const v=raw<0n?-raw:raw;if(v>=1_000_000n)return`${sign}${v/1_000_000n}${v%1_000_000n?`.${((v%1_000_000n)*10n/1_000_000n).toString()}`:""} MW`;if(v>=1_000n)return`${sign}${v/1_000n}${v%1_000n?`.${((v%1_000n)*10n/1_000n).toString()}`:""} kW`;return`${raw} W`}

export function DigitalEnergyCommandCenter({compact=false}:{compact?:boolean}){
  const[payload,setPayload]=useState<DigitalEnergyApiEnvelope<DigitalEnergyOverviewPayload>|null>(null);
  const[error,setError]=useState<string|null>(null);
  const[loading,setLoading]=useState(true);
  const load=useCallback(async()=>{setLoading(true);try{const next=await fetchDigitalEnergyOverview();setPayload(next);setError(null)}catch(cause){setError(cause instanceof Error?cause.message:"Digital Energy API unavailable")}finally{setLoading(false)}},[]);
  useEffect(()=>{void load();const timer=window.setInterval(()=>void load(),30_000);return()=>window.clearInterval(timer)},[load]);

  const data=payload?.data;
  const summary=data?.summary;
  const operations=data?.operations;
  const opSummary=operations?.summary;
  const providers=data?.providers?.marketData;
  const epoch=data?.rewardEpoch;
  const graph=data?.assetGraph;
  const cards=[
    ["Verified backing",summary?wh(summary.verifiedWh):"—","Physical Energy Ledger",DatabaseZap],
    ["Available",summary?wh(summary.availableWh):"—","Unissued verified backing",Gauge],
    ["Energy RWA",summary?wh(summary.activePositionWh):"—","PET-20 positions",Boxes],
    ["Reserved",summary?wh(summary.reservedWh):"—","Active commitments",ShieldCheck],
    ["On-chain",summary?wh(summary.representedWh):"—",summary?`${ppm(summary.representationCoveragePpm)} represented`:"Solana + Sui",Network],
    ["Delivered",opSummary?wh(opSummary.deliveredWh):"—","Meter-evidenced physical delivery",Cable],
  ] as const;

  return <section className="digital-energy-command" aria-label="Digital Energy OS command center">
    <header className="digital-energy-hero">
      <div>
        <div className="flex flex-wrap items-center gap-2"><span className="eyebrow">PowerChain Digital Energy OS</span><span className={`data-mode-chip ${summary?.dataMode.toLowerCase()??"loading"}`}>{loading?"CHECKING":summary?.dataMode??"UNAVAILABLE"}</span></div>
        <h2>Operate physical energy, delivery and digital settlement from one control plane.</h2>
        <p>Verified energy remains authoritative. Digital Twin state, Energy RWA, delivery evidence, reconciliation, financial settlement, rewards and Solana/Sui representation remain explicit domains with auditable boundaries.</p>
      </div>
      <div className="digital-energy-hero-actions">
        <button type="button" onClick={()=>void load()} disabled={loading}><RefreshCw className={loading?"animate-spin":""}/>{loading?"Refreshing":"Refresh"}</button>
        <Link href="/digital-energy">Open Digital Energy OS <ArrowUpRight/></Link>
      </div>
    </header>

    {error&&<div className="digital-energy-error"><ShieldCheck/><div><strong>Digital Energy API unavailable</strong><span>{error}</span></div></div>}

    <div className="digital-energy-stat-grid">
      {cards.map(([label,value,detail,Icon],index)=><article key={label} className={index===0?"primary":""}><Icon/><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>)}
    </div>

    <div className="digital-energy-separation" aria-label="Canonical domain separation">
      {['ELECTRICITY','ENERGY RWA','DELIVERY','MONEY','PWRC','wPWRC'].map((item,index)=><span key={item}>{index>0&&<i>≠</i>}<b>{item}</b></span>)}
    </div>

    {!compact&&<>
      <div className="digital-energy-grid operations-grid">
        <article className="digital-energy-panel operations-panel">
          <div className="digital-energy-panel-head"><div><span className="eyebrow">Operational Digital Twin</span><h3>Physical infrastructure state</h3></div><Link href="/digital-energy/twin">Open twin <ArrowUpRight/></Link></div>
          <div className="operations-kpi-row">
            <div><Factory/><span>Assets</span><strong>{opSummary?.twinAssets??0}</strong></div>
            <div><Gauge/><span>Stale</span><strong>{opSummary?.staleTwinAssets??0}</strong></div>
            <div><Activity/><span>Offline</span><strong>{opSummary?.offlineTwinAssets??0}</strong></div>
          </div>
          <div className="twin-rail-list">
            {(operations?.twins??[]).slice(0,4).map(twin=><div key={twin.id}><span className={`twin-state ${stateClass(twin.state)}`}/><div><strong>{twin.label}</strong><small>{twin.assetType.replaceAll('_',' ')} · {twin.freshness} · {twin.telemetryAgeSeconds}s</small></div><b>{twin.powerW?powerW(twin.powerW):twin.state}</b></div>)}
            {!operations?.twins.length&&<p className="digital-energy-note">No Digital Twin telemetry loaded.</p>}
          </div>
        </article>

        <article className="digital-energy-panel operations-panel">
          <div className="digital-energy-panel-head"><div><span className="eyebrow">Delivery → reconciliation → settlement</span><h3>Operational completion</h3></div><div className="flex items-center gap-3"><Link href="/digital-energy/controls">Controls <ArrowUpRight/></Link><Link href="/energy-operations">Open operations <ArrowUpRight/></Link></div></div>
          <div className="operations-kpi-row">
            <div><Cable/><span>Deliveries</span><strong>{opSummary?.activeDeliveries??0}</strong></div>
            <div><Scale/><span>Review</span><strong>{opSummary?.reviewRequiredReconciliations??0}</strong></div>
            <div><WalletCards/><span>Pending</span><strong>{opSummary?.pendingSettlements??0}</strong></div>
          </div>
          <div className="operations-flow">
            <span>COMMIT</span><i>→</i><span>DELIVER</span><i>→</i><span>RECONCILE</span><i>→</i><span>SETTLE</span><i>→</i><span>RETIRE</span>
          </div>
          <p className="digital-energy-note">Financial settlement does not prove physical delivery. Meter evidence and reconciliation remain authoritative for delivered Wh.</p>
        </article>
      </div>

      <div className="digital-energy-grid">
        <article className="digital-energy-panel">
          <div className="digital-energy-panel-head"><div><span className="eyebrow">Canonical Asset Graph</span><h3>Physical → verified → represented</h3></div><Link href="/asset-graph">Explore graph <ArrowUpRight/></Link></div>
          <div className="mini-asset-graph">
            {['SITE','ENERGY_BATCH','ENERGY_POSITION','CHAIN_REPRESENTATION'].map((type,index)=>{const count=graph?.nodes.filter(node=>node.type===type).length??0;return <div key={type} className={`mini-graph-node node-${index}`}><span>{type.replaceAll('_',' ')}</span><strong>{count}</strong>{index<3&&<i>→</i>}</div>})}
          </div>
          <p className="digital-energy-note">Relationship graph only. Canonical accounting remains in the verified Energy Ledger.</p>
        </article>

        <article className="digital-energy-panel">
          <div className="digital-energy-panel-head"><div><span className="eyebrow">Networks & data</span><h3>Execution boundaries</h3></div><Link href="/energy-rwa">Manage RWA <ArrowUpRight/></Link></div>
          <div className="network-rail-list">
            <div><span className="network-orb solana"><Zap/></span><div><strong>Solana / SVM</strong><small>PWRC native · Token-2022 · PET-20</small></div><b>{summary?wh(summary.representedSolanaWh):"—"}</b></div>
            <div><span className="network-orb sui"><Network/></span><div><strong>Sui / Move</strong><small>wPWRC 1:1 bridge-backed · objects</small></div><b>{summary?wh(summary.representedSuiWh):"—"}</b></div>
            <div><span className="network-orb reward"><ShieldCheck/></span><div><strong>Reward epoch</strong><small>{epoch?.epochId??"Policy not configured"} · PWRC on Solana</small></div><b>{epoch?epoch.state:"UNRESOLVED"}</b></div>
          </div>
          <div className="provider-strip">
            {[["Pyth",providers?.pyth.state],["Birdeye",providers?.birdeye.state],["CoinMarketCap",providers?.coinmarketcap.state],["FX / ECB",providers?.fx.state]].map(([name,state])=><span key={name}><i className={`provider-state ${state??"unavailable"}`}/>{name}<b>{state??"unresolved"}</b></span>)}
          </div>
        </article>
      </div>

      <article className="digital-energy-panel">
        <div className="digital-energy-panel-head"><div><span className="eyebrow">Energy RWA ledger</span><h3>Verified Energy Positions</h3></div><span className="source-observed">{payload?.meta.observedAt?`Observed ${new Date(payload.meta.observedAt).toLocaleTimeString()}`:"Awaiting source"}</span></div>
        <div className="digital-energy-table-wrap"><table className="digital-energy-table"><thead><tr><th>Position</th><th>Source</th><th>State</th><th>Canonical</th><th>Reserved</th><th>Represented</th><th>Networks</th><th>Evidence</th></tr></thead><tbody>
          {(data?.rwas??[]).map(rwa=>{const reserved=rwa.reservations.filter(item=>item.state==='ACTIVE').reduce((sum,item)=>sum+BigInt(item.amountWh),0n);const represented=rwa.representations.filter(item=>item.state!=='RETIRED').reduce((sum,item)=>sum+BigInt(item.amountWh),0n);return <tr key={rwa.id}><td><strong>{rwa.position.id}</strong><small>{rwa.metadata.assetClass}</small></td><td>{rwa.position.source}</td><td><span className="position-state">{rwa.position.state}</span></td><td>{wh(rwa.position.amountWh)}</td><td>{wh(reserved)}</td><td>{wh(represented)}</td><td><div className="chain-tags">{rwa.representations.filter(item=>item.state!=='RETIRED').map(item=><span key={item.id} className={item.network.toLowerCase()}>{item.network}</span>)}{!rwa.representations.some(item=>item.state!=='RETIRED')&&<span>OFF-CHAIN</span>}</div></td><td className="mono">{short(rwa.position.evidenceRoot)}</td></tr>})}
          {!data?.rwas?.length&&<tr><td colSpan={8}>No Energy RWA state loaded.</td></tr>}
        </tbody></table></div>
      </article>
    </>}
  </section>
}
