"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityLogIcon,
  CheckCircledIcon,
  ClockIcon,
  LightningBoltIcon,
  MagnifyingGlassIcon,
  ReloadIcon,
  SewingPinIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";
import { ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateTradeTotal, validateP2PQuantity } from "@/lib/p2p";
import type { EnergyCommunitySummary, ListingMode, LocalEnergyListing, P2POrder, P2POrderStatus } from "@/types/p2p";

const modes:{value:ListingMode;label:string}[]=[
  {value:"sell",label:"Buy energy"},
  {value:"buy",label:"Sell surplus"},
  {value:"rent",label:"Rent assets"},
];
const emptySummary:EnergyCommunitySummary={members:0,producers:0,consumers:0,batteries:0,localSupplyKwh:0,localDemandKwh:0,matchedPercent:0,averagePrice:0,carbonAvoidedKg:0};
const money=(value:number,currency="EUR")=>new Intl.NumberFormat("en-FI",{style:"currency",currency,maximumFractionDigits:3}).format(value);

export function P2PMarketplace(){
  const[mode,setMode]=useState<ListingMode>("sell");
  const[query,setQuery]=useState("");
  const[radius,setRadius]=useState(25);
  const[selected,setSelected]=useState<LocalEnergyListing|null>(null);
  const[quantity,setQuantity]=useState(25);
  const[notice,setNotice]=useState("");
  const[tab,setTab]=useState<"market"|"activity">("market");
  const[summary,setSummary]=useState<EnergyCommunitySummary>(emptySummary);
  const[allListings,setAllListings]=useState<LocalEnergyListing[]>([]);
  const[orders,setOrders]=useState<P2POrder[]>([]);
  const[dataMode,setDataMode]=useState<"DEMO"|"LIVE"|"DEGRADED">("DEMO");
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const[communityResponse,listingsResponse,ordersResponse]=await Promise.all([
        fetch("/api/v1/p2p/community",{cache:"no-store"}),
        fetch("/api/v1/p2p/listings?radius=50",{cache:"no-store"}),
        fetch("/api/v1/p2p/orders",{cache:"no-store"}),
      ]);
      const[community,listingsPayload,ordersPayload]=await Promise.all([communityResponse.json(),listingsResponse.json(),ordersResponse.json()]);
      if(!communityResponse.ok)throw new Error(community?.error?.message??"Local Energy community is unavailable");
      if(!listingsResponse.ok)throw new Error(listingsPayload?.error?.message??"Local Energy listings are unavailable");
      if(!ordersResponse.ok)throw new Error(ordersPayload?.error?.message??"Local Energy activity is unavailable");
      setSummary(community.data.summary);
      setAllListings(listingsPayload.data);
      setOrders(ordersPayload.data);
      setDataMode(listingsPayload?.meta?.dataMode??community?.meta?.dataMode??"DEMO");
      setError(null);
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Local Energy is unavailable");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{void load()},[load]);

  const listings=useMemo(()=>allListings
    .filter(item=>item.mode===mode&&item.distanceKm<=radius)
    .filter(item=>(`${item.title} ${item.location} ${item.sellerName}`).toLowerCase().includes(query.toLowerCase())),
    [allListings,mode,query,radius],
  );
  const totals=selected?calculateTradeTotal(quantity,selected.pricePerKwh):null;
  const quantityError=selected?validateP2PQuantity(quantity,selected.minimumKwh,selected.availableKwh):null;

  async function submit(){
    if(!selected||quantityError)return;
    setNotice("Creating reviewable Local Energy reservation…");
    const idempotencyKey=`local-energy-${crypto.randomUUID()}`;
    const response=await fetch("/api/v1/p2p/orders",{
      method:"POST",
      headers:{"content-type":"application/json","Idempotency-Key":idempotencyKey},
      body:JSON.stringify({listingId:selected.id,quantityKwh:quantity}),
    });
    const body=await response.json();
    if(!response.ok){
      setNotice(body?.error?.message??"Unable to create Local Energy order.");
      return;
    }
    const order:P2POrder=body.data.order;
    setNotice(`Order ${order.id} is ${statusLabel(order.status)}. Review the reservation before any external wallet or payment step.`);
    setSelected(current=>current?{...current,availableKwh:Math.max(0,current.availableKwh-quantity)}:current);
    await load();
  }

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-[28px] border border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-700 p-6 text-white shadow-xl md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[.16em]"><LightningBoltIcon/> Local Energy OS · {dataMode}</div>
          <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">Trade, share, and coordinate clean energy locally.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-50/80 md:text-base">Match prosumers and consumers, reserve shared batteries or EV chargers, and settle only after meter-evidenced delivery is reconciled.</p>
          {summary.dataState==="UNAVAILABLE"&&<p className="mt-4 rounded-xl border border-amber-200/20 bg-amber-100/10 p-3 text-xs text-amber-50">Live community aggregate telemetry is not configured. Marketplace/order data remains live; aggregate energy metrics are shown as unavailable rather than demo values.</p>}
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-emerald-50/80">
            <span className="rounded-full border border-white/15 px-3 py-1.5">Wh remains canonical</span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">Grid constrained</span>
            <span className="rounded-full border border-white/15 px-3 py-1.5">Meter evidence before settlement</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 self-end">
          <Metric label="Community members" value={summary.members===null?"—":String(summary.members)}/>
          <Metric label="Local match rate" value={summary.matchedPercent===null?"—":`${summary.matchedPercent}%`}/>
          <Metric label="Local supply" value={summary.localSupplyKwh===null?"—":`${(summary.localSupplyKwh/1000).toFixed(1)} MWh`}/>
          <Metric label="CO₂ avoided" value={summary.carbonAvoidedKg===null?"—":`${(summary.carbonAvoidedKg/1000).toFixed(1)} t`}/>
        </div>
      </div>
    </section>

    {error&&<div className="flex items-center justify-between gap-4 rounded-xl border border-red-300/60 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/20 dark:text-red-200"><span>{error}</span><button type="button" onClick={()=>void load()} className="inline-flex items-center gap-2 font-bold"><ReloadIcon/>Retry</button></div>}

    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)]">
      <div className="flex gap-2"><Tab active={tab==="market"} onClick={()=>setTab("market")}>Marketplace</Tab><Tab active={tab==="activity"} onClick={()=>setTab("activity")}>My energy activity</Tab></div>
      <button type="button" onClick={()=>void load()} className="inline-flex items-center gap-2 pb-3 text-xs font-bold text-emerald-800"><ReloadIcon className={loading?"animate-spin":""}/>Refresh</button>
    </div>

    {tab==="activity"?<ActivityPanel orders={orders}/>:<>
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex rounded-xl bg-black/[.04] p-1 dark:bg-white/[.05]">{modes.map(item=><button key={item.value} onClick={()=>{setMode(item.value);setSelected(null)}} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${mode===item.value?"bg-white text-emerald-900 shadow-sm dark:bg-emerald-800 dark:text-white":"muted"}`}>{item.label}</button>)}</div>
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] px-3"><MagnifyingGlassIcon className="muted"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search local offers, seller, or city" className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
          <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"><SewingPinIcon/><span>Within {radius} km</span><input type="range" min="5" max="50" step="5" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="grid gap-4 md:grid-cols-2">
          {loading&&<div className="col-span-full rounded-2xl border border-dashed p-10 text-center muted">Loading tenant-scoped Local Energy offers…</div>}
          {!loading&&listings.map(item=><OfferCard key={item.id} item={item} selected={selected?.id===item.id} onSelect={()=>{setSelected(item);setQuantity(Math.max(item.minimumKwh,Math.min(25,item.availableKwh)));setNotice("")}}/>)}
          {!loading&&!listings.length&&<div className="col-span-full rounded-2xl border border-dashed p-10 text-center muted">No local offers match these filters.</div>}
        </section>

        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm xl:sticky xl:top-24">
          <h3 className="text-lg font-extrabold">{mode==="rent"?"Rental reservation":"Metered trade review"}</h3>
          {selected?<>
            <p className="mt-1 text-sm muted">{selected.title}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><Pill>{selected.settlementAsset} settlement</Pill><Pill>{selected.meterVerified?"Smart meter verified":"Manual meter review"}</Pill></div>
            <label className="mt-5 block text-sm font-bold">{mode==="rent"?"Capacity":"Energy quantity"} (kWh)<input type="number" min={selected.minimumKwh} max={selected.availableKwh} value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="mt-2 h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 outline-none focus:ring-2 focus:ring-emerald-600"/></label>
            {quantityError&&<p className="mt-2 text-xs text-red-600">{quantityError}</p>}
            <div className="mt-5 space-y-3 rounded-xl bg-black/[.025] p-4 text-sm dark:bg-white/[.04]">
              <Row label="Unit price" value={money(selected.pricePerKwh,selected.currency)}/>
              <Row label="Subtotal" value={money(totals?.subtotal??0,selected.currency)}/>
              <Row label="Network fee" value={money(totals?.networkFee??0,selected.currency)}/>
              <Row label="Reservation reserve" value={money(totals?.escrowReserve??0,selected.currency)}/>
              <div className="border-t border-[var(--border)] pt-3"><Row label="Estimated total" value={money(totals?.total??0,selected.currency)} strong/></div>
            </div>
            {selected.rental&&<p className="mt-3 text-xs muted">Deposit {money(selected.rental.deposit)} · {selected.rental.slotsAvailable} slots · billed per {selected.rental.billingPeriod}</p>}
            <Button className="mt-5 w-full" size="lg" disabled={Boolean(quantityError)||loading} onClick={submit}>{mode==="rent"?"Create rental reservation":"Create reviewable reservation"}</Button>
            {notice&&<p className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}
            <div className="mt-4 grid grid-cols-5 gap-1 text-center text-[9px] font-bold text-[var(--muted)]"><span>Reserve</span><span>Deliver</span><span>Meter</span><span>Reconcile</span><span>Settle</span></div>
            <p className="mt-3 text-center text-[11px] muted">Settlement is blocked until metered delivery is recorded and reconciled.</p>
          </>:<div className="mt-8 rounded-xl border border-dashed p-8 text-center text-sm muted">Select a local offer to review pricing, metering, grid constraints, and settlement.</div>}
        </aside>
      </div>
    </>}
  </div>;
}

function ActivityPanel({orders}:{orders:P2POrder[]}){
  return <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-center gap-2"><ActivityLogIcon/><h3 className="font-extrabold">Recent local energy activity</h3></div>
      <div className="mt-4 space-y-3">{orders.map(order=><div key={order.id} className="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="font-bold">{order.quantityKwh} kWh · {order.settlementAsset}</div><div className="mt-1 text-xs muted">{order.id} · {new Date(order.createdAt).toLocaleString()}</div>{order.deliveredKwh!==undefined&&order.deliveredKwh>0&&<div className="mt-1 text-xs muted">Delivered {order.deliveredKwh} kWh{order.varianceKwh?` · variance ${order.varianceKwh} kWh`:""}</div>}</div>
        <div className="flex items-center gap-3"><Status status={order.status}/><strong>{money(order.pricing.total,order.currency)}</strong></div>
      </div>)}
      {!orders.length&&<div className="mt-4 rounded-xl border border-dashed p-8 text-center text-sm muted">No Local Energy orders yet.</div>}
      </div>
    </section>
    <aside className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h3 className="font-extrabold">Controlled settlement lifecycle</h3>
      <ol className="mt-4 space-y-4 text-sm">
        <Step n="1" text="Create a tenant-scoped reservation with an idempotency key."/>
        <Step n="2" text="Record physical delivery from meter evidence."/>
        <Step n="3" text="Reconcile expected and delivered Wh."/>
        <Step n="4" text="Settle only after the order reaches settlement-ready state."/>
      </ol>
      <div className="mt-5 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"><ShieldCheck className="mb-2 h-4 w-4"/>Wallet or payment confirmation never substitutes for delivery evidence.</div>
    </aside>
  </div>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.08] p-4 backdrop-blur"><div className="text-xl font-black">{value}</div><div className="mt-1 text-xs text-emerald-50/70">{label}</div></div>}
function OfferCard({item,selected,onSelect}:{item:LocalEnergyListing;selected:boolean;onSelect:()=>void}){return <button onClick={onSelect} className={`rounded-2xl border bg-[var(--surface)] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selected?"border-emerald-600 ring-2 ring-emerald-600/15":"border-[var(--border)]"}`}><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">{item.source}</span><span className="flex items-center gap-1 text-xs muted"><SewingPinIcon/>{item.distanceKm} km</span></div><h3 className="mt-4 text-lg font-extrabold">{item.title}</h3><p className="mt-1 text-sm muted">{item.sellerName}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-xs"><span className="flex items-center gap-1"><StarFilledIcon className="text-amber-500"/>{item.sellerRating}</span>{item.verified&&<span className="flex items-center gap-1 text-emerald-700"><CheckCircledIcon/>Verified</span>}{item.meterVerified&&<span className="flex items-center gap-1 text-sky-700"><ClockIcon/>Metered</span>}</div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4"><div><div className="text-xs muted">Available</div><div className="font-extrabold">{item.availableKwh} kWh</div></div><div className="text-right"><div className="text-xs muted">{item.mode==="rent"?"Rental rate":"Energy price"}</div><div className="font-extrabold text-emerald-700">{money(item.pricePerKwh,item.currency)}<span className="text-xs font-medium muted">/{item.mode==="rent"?item.rental?.billingPeriod:"kWh"}</span></div></div></div></button>}
function Row({label,value,strong=false}:{label:string;value:string;strong?:boolean}){return <div className={`flex justify-between gap-3 ${strong?"font-extrabold":""}`}><span className="muted">{label}</span><span>{value}</span></div>}
function Tab({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){return <button onClick={onClick} className={`border-b-2 px-3 py-3 text-sm font-bold ${active?"border-emerald-700 text-emerald-800":"border-transparent muted"}`}>{children}</button>}
function Pill({children}:{children:React.ReactNode}){return <span className="rounded-full bg-black/[.04] px-2 py-1 dark:bg-white/[.06]">{children}</span>}
function statusLabel(status:P2POrderStatus){const labels:Record<P2POrderStatus,string>={review_required:"Review required",reserved:"Reserved",delivering:"Delivering",delivered:"Delivered",reconciled:"Reconciled",settlement_ready:"Settlement ready",settled:"Settled",cancelled:"Cancelled",disputed:"Disputed"};return labels[status]}
function Status({status}:{status:P2POrderStatus}){return <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700">{statusLabel(status)}</span>}
function Step({n,text}:{n:string;text:string}){return <li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-black text-white">{n}</span><span className="pt-1 muted">{text}</span></li>}
