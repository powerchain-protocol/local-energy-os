"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  Cable,
  CircleGauge,
  Gauge,
  Grid3X3,
  HousePlug,
  Network,
  RadioTower,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { energyCommunitySummary, localEnergyListings } from "@/data/p2p-energy";
import { localEnergyBalance, kwhToWh, whToKwh, LOCAL_ENERGY_FLOW } from "@powerchain/local-energy";
import { useApp } from "@/context/app-context";

const number=new Intl.NumberFormat("en-FI",{maximumFractionDigits:1});
const eur=new Intl.NumberFormat("en-FI",{style:"currency",currency:"EUR",maximumFractionDigits:3});

const modules=[
  {href:"/local-energy/marketplace",label:"Local Market",description:"Prosumer offers, flexibility requests and shared energy assets.",icon:Zap},
  {href:"/local-energy/grid",label:"Grid & Flexibility",description:"Local balance, constraints, grid signals and VPP coordination.",icon:Grid3X3},
  {href:"/local-energy/devices",label:"Devices & Edge",description:"Meters, batteries, EV charging and energy infrastructure.",icon:RadioTower},
  {href:"/local-energy/settlement",label:"Settlement",description:"Meter-evidenced delivery, reconciliation and payment status.",icon:WalletCards},
] as const;

export function LocalEnergyCommandCenter(){
  const {setCopilotOpen}=useApp();
  const[overview,setOverview]=useState<null|{
    community:{dataState:"DEMO"|"UNAVAILABLE";source:string;members:number|null;producers:number|null;consumers:number|null;batteries:number|null;localSupplyWh:string|null;localDemandWh:string|null;matchedPercent:number|null;averagePrice:number|null;carbonAvoidedKg:number|null};
    market:{activeListings:number;activeOrders:number;deliveredWh:string;openFlexibilitySignals:number};
    status:Record<string,string>;
  }>(null);
  const[dataMode,setDataMode]=useState("DEMO");
  const[refreshing,setRefreshing]=useState(false);

  async function refresh(){
    setRefreshing(true);
    try{
      const response=await fetch("/api/v1/local-energy/overview",{cache:"no-store"});
      const body=await response.json();
      if(response.ok){
        setOverview(body.data);
        setDataMode(body?.meta?.dataMode??"DEMO");
      }
    }finally{setRefreshing(false)}
  }
  useEffect(()=>{void refresh()},[]);

  const summary=overview?{
    members:overview.community.members,
    producers:overview.community.producers,
    consumers:overview.community.consumers,
    batteries:overview.community.batteries,
    localSupplyKwh:overview.community.localSupplyWh===null?null:Number(overview.community.localSupplyWh)/1_000,
    localDemandKwh:overview.community.localDemandWh===null?null:Number(overview.community.localDemandWh)/1_000,
    matchedPercent:overview.community.matchedPercent,
    averagePrice:overview.community.averagePrice,
    carbonAvoidedKg:overview.community.carbonAvoidedKg,
  }:energyCommunitySummary;
  const balance=summary.localSupplyKwh===null||summary.localDemandKwh===null
    ? {netWh:0n,state:"UNAVAILABLE" as const}
    : localEnergyBalance({
        supplyWh:kwhToWh(summary.localSupplyKwh),
        demandWh:kwhToWh(summary.localDemandKwh),
      });
  const activeOffers=overview?.market.activeListings??localEnergyListings.filter(item=>item.status==="active").length;
  const renewableOffers=localEnergyListings.filter(item=>item.renewablePercent===100).length;

  const flow=useMemo(()=>LOCAL_ENERGY_FLOW.map(step=>step.replaceAll("_"," ")),[]);

  return <div className="local-energy-workspace space-y-6">
    <section className="local-energy-hero">
      <div>
        <span className="eyebrow">POWERCHAIN LOCAL ENERGY OS · v1.0.0 · {dataMode}</span>
        <h1>Coordinate local electricity without confusing energy, markets, or money.</h1>
        <p>Smart metering, communities, grid-aware P2P markets, flexibility, batteries, EV charging, Energy RWA and settlement share one operational context while physical electricity remains authoritative.</p>
        <div className="local-energy-hero-actions">
          <Link href="/local-energy/marketplace">Open local market <ArrowRight/></Link>
          <button type="button" onClick={()=>setCopilotOpen(true)}><Sparkles/>Ask Copilot</button>
          <button type="button" onClick={()=>void refresh()} disabled={refreshing}><Activity className={refreshing?"animate-pulse":""}/>{refreshing?"Refreshing…":"Refresh"}</button>
        </div>
      </div>
      <div className="local-energy-balance-card">
        <div className="local-energy-balance-top"><span>COMMUNITY BALANCE</span><strong className={balance.state.toLowerCase()}>{balance.state}</strong></div>
        <div className="local-energy-balance-value">{balance.state==="UNAVAILABLE"?"—":number.format(Math.abs(whToKwh(balance.netWh))/1000)} <small>{balance.state==="UNAVAILABLE"?"LIVE SOURCE UNAVAILABLE":"MWh"}</small></div>
        <div className="local-energy-balance-bars">
          <div><span>Local supply</span><strong>{summary.localSupplyKwh===null?"—":`${number.format(summary.localSupplyKwh/1000)} MWh`}</strong></div>
          <div><span>Local demand</span><strong>{summary.localDemandKwh===null?"—":`${number.format(summary.localDemandKwh/1000)} MWh`}</strong></div>
        </div>
        <p>Live physical delivery requires meter evidence. Financial or blockchain confirmation does not create electricity.{overview?` Grid ${overview.status.grid} · Settlement ${overview.status.settlement}.`:""}</p>
      </div>
    </section>

    <section className="local-energy-metric-grid">
      <article><HousePlug/><div><span>Community members</span><strong>{summary.members??"—"}</strong><small>{summary.producers===null||summary.consumers===null?"Live aggregate unavailable":`${summary.producers} producers · ${summary.consumers} consumers`}</small></div></article>
      <article><Activity/><div><span>Local match rate</span><strong>{summary.matchedPercent===null?"—":`${summary.matchedPercent}%`}</strong><small>{summary.matchedPercent===null?"Live aggregate unavailable":"Supply matched locally"}</small></div></article>
      <article><BatteryCharging/><div><span>Flexible storage</span><strong>{summary.batteries??"—"}</strong><small>{summary.batteries===null?"Live aggregate unavailable":"Community batteries"}</small></div></article>
      <article><Gauge/><div><span>Average energy price</span><strong>{summary.averagePrice===null?"—":eur.format(summary.averagePrice)}</strong><small>{summary.averagePrice===null?"No active live listings":"per kWh"}</small></div></article>
      <article><Cable/><div><span>Active offers</span><strong>{activeOffers}</strong><small>{overview?`${overview.market.activeOrders} active orders`:`${renewableOffers} fully renewable`}</small></div></article>
      <article><ShieldCheck/><div><span>Delivery authority</span><strong>METERED</strong><small>Evidence before settlement</small></div></article>
    </section>

    <section className="local-energy-module-grid">
      {modules.map(({href,label,description,icon:Icon})=><Link key={href} href={href}>
        <div className="local-energy-module-icon"><Icon/></div>
        <span>LOCAL ENERGY</span>
        <h2>{label}</h2>
        <p>{description}</p>
        <div className="local-energy-module-link">Open workspace <ArrowRight/></div>
      </Link>)}
    </section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,.7fr)]">
      <article className="dashboard-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">CANONICAL ENERGY FLOW</span><h2>Measure to reward</h2></div><Network className="h-5 w-5 text-emerald-700"/></div>
        <div className="local-energy-flow mt-4">
          {flow.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,"0")}</span><strong>{step}</strong>{index<flow.length-1&&<ArrowRight/>}</div>)}
        </div>
      </article>

      <article className="dashboard-panel">
        <div className="dashboard-card-head"><div><span className="eyebrow">SYSTEM BOUNDARY</span><h2>Separate authoritative domains</h2></div><CircleGauge className="h-5 w-5 text-emerald-700"/></div>
        <div className="local-energy-domain-list mt-4">
          <div><span>01</span><strong>Physical Energy</strong><small>Meters · devices · SCADA · telemetry</small></div>
          <div><span>02</span><strong>Energy Evidence</strong><small>Proofs · batches · provenance · location</small></div>
          <div><span>03</span><strong>Energy Markets</strong><small>Offers · reservations · grid constraints · delivery</small></div>
          <div><span>04</span><strong>Financial Settlement</strong><small>Money · stablecoins · accounting · reconciliation</small></div>
          <div><span>05</span><strong>Blockchain</strong><small>Solana · Sui · optional Energy RWA representation</small></div>
          <div><span>06</span><strong>Rewards</strong><small>PWRC incentives remain distinct from Wh</small></div>
        </div>
      </article>
    </section>
  </div>;
}
