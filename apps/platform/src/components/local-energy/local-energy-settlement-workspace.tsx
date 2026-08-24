"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Gauge,
  LockKeyhole,
  RefreshCw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import type { P2POrder, P2POrderStatus } from "@/types/p2p";

type ActionBody={
  action:"CONFIRM_RESERVATION"|"START_DELIVERY"|"RECORD_DELIVERY"|"RECONCILE"|"MARK_SETTLEMENT_READY"|"MARK_SETTLED"|"CANCEL"|"DISPUTE";
  reservationReference?:string;
  deliveredKwh?:number;
  meterEvidenceRoot?:string;
  toleranceKwh?:number;
  settlementReference?:string;
};

const money=(value:number,currency:string)=>new Intl.NumberFormat("en-FI",{style:"currency",currency,maximumFractionDigits:3}).format(value);

function nextLabel(status:P2POrderStatus){
  switch(status){
    case"review_required":return"Confirm external reservation";
    case"reserved":return"Start delivery";
    case"delivering":return"Record meter delivery";
    case"delivered":return"Reconcile delivery";
    case"reconciled":return"Mark settlement ready";
    case"settlement_ready":return"Record external settlement";
    default:return null;
  }
}

export function LocalEnergySettlementWorkspace(){
  const[orders,setOrders]=useState<P2POrder[]>([]);
  const[loading,setLoading]=useState(true);
  const[busy,setBusy]=useState<string|null>(null);
  const[error,setError]=useState<string|null>(null);
  const[dataMode,setDataMode]=useState("DEMO");

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const response=await fetch("/api/v1/p2p/orders",{cache:"no-store"});
      const body=await response.json();
      if(!response.ok)throw new Error(body?.error?.message??"Local Energy settlement activity is unavailable");
      setOrders(body.data);
      setDataMode(body?.meta?.dataMode??"DEMO");
      setError(null);
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Local Energy settlement activity is unavailable");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{void load()},[load]);

  const metrics=useMemo(()=>({
    review:orders.filter(order=>order.status==="review_required").length,
    delivery:orders.filter(order=>["reserved","delivering","delivered"].includes(order.status)).length,
    reconcile:orders.filter(order=>order.status==="reconciled").length,
    settlement:orders.filter(order=>order.status==="settlement_ready").length,
    settled:orders.filter(order=>order.status==="settled").length,
  }),[orders]);

  async function send(order:P2POrder,body:ActionBody){
    setBusy(`${order.id}:${body.action}`);
    setError(null);
    try{
      const response=await fetch(`/api/v1/p2p/orders/${encodeURIComponent(order.id)}`,{
        method:"PATCH",
        headers:{"content-type":"application/json","Idempotency-Key":`local-energy-transition-${crypto.randomUUID()}`},
        body:JSON.stringify(body),
      });
      const payload=await response.json();
      if(!response.ok)throw new Error(payload?.error?.message??"Local Energy order update failed");
      await load();
    }catch(cause){
      setError(cause instanceof Error?cause.message:"Local Energy order update failed");
    }finally{
      setBusy(null);
    }
  }

  async function advance(order:P2POrder){
    switch(order.status){
      case"review_required":{
        const reference=window.prompt("Paste the external wallet/payment reservation reference. Copilot and Local Energy OS do not create this signature.");
        if(!reference?.trim())return;
        return send(order,{action:"CONFIRM_RESERVATION",reservationReference:reference.trim()});
      }
      case"reserved":
        return send(order,{action:"START_DELIVERY"});
      case"delivering":{
        const delivered=Number(window.prompt(`Delivered energy in kWh (expected ${order.quantityKwh})`,String(order.quantityKwh))??"");
        if(!Number.isFinite(delivered)||delivered<=0)return;
        const evidence=window.prompt("Meter evidence root / signed meter reading reference");
        if(!evidence?.trim())return;
        return send(order,{action:"RECORD_DELIVERY",deliveredKwh:delivered,meterEvidenceRoot:evidence.trim()});
      }
      case"delivered":{
        const tolerance=Number(window.prompt("Reconciliation tolerance in kWh","0.10")??"0");
        if(!Number.isFinite(tolerance)||tolerance<0)return;
        return send(order,{action:"RECONCILE",toleranceKwh:tolerance});
      }
      case"reconciled":
        return send(order,{action:"MARK_SETTLEMENT_READY"});
      case"settlement_ready":{
        const reference=window.prompt("Paste the external settlement / transaction / accounting reference");
        if(!reference?.trim())return;
        return send(order,{action:"MARK_SETTLED",settlementReference:reference.trim()});
      }
    }
  }

  return <div className="content-container space-y-6">
    <header className="local-energy-section-hero">
      <span className="eyebrow">LOCAL ENERGY · SETTLEMENT · {dataMode}</span>
      <h1>Payment is downstream of physical delivery evidence.</h1>
      <p>Every order moves through reservation, physical delivery, meter evidence, reconciliation and settlement readiness. A wallet signature or blockchain confirmation is never accepted as proof that electricity was delivered.</p>
    </header>

    {error&&<div className="digital-energy-error"><CircleAlert/><div><strong>Local Energy notice</strong><span>{error}</span></div></div>}

    <section className="local-energy-metric-grid">
      <article><LockKeyhole/><div><span>Needs review</span><strong>{metrics.review}</strong><small>Reservation approval boundary</small></div></article>
      <article><Gauge/><div><span>In delivery</span><strong>{metrics.delivery}</strong><small>Physical energy lifecycle</small></div></article>
      <article><Scale/><div><span>Reconciled</span><strong>{metrics.reconcile}</strong><small>Expected vs delivered Wh</small></div></article>
      <article><WalletCards/><div><span>Settlement ready</span><strong>{metrics.settlement}</strong><small>Financial completion permitted</small></div></article>
      <article><CheckCircle2/><div><span>Settled</span><strong>{metrics.settled}</strong><small>External reference recorded</small></div></article>
      <article><ShieldCheck/><div><span>Delivery authority</span><strong>METERED</strong><small>Never wallet-derived</small></div></article>
    </section>

    <section className="dashboard-panel">
      <div className="dashboard-card-head">
        <div><span className="eyebrow">CONTROLLED ORDER LIFECYCLE</span><h2>Local Energy settlement queue</h2></div>
        <button type="button" className="text-link" onClick={()=>void load()}><RefreshCw className={loading?"animate-spin":""}/>Refresh</button>
      </div>
      <div className="local-energy-order-list mt-4">
        {orders.map(order=>{
          const label=nextLabel(order.status);
          return <article key={order.id}>
            <div className="local-energy-order-main">
              <div><span>{order.status.replaceAll("_"," ").toUpperCase()}</span><strong>{order.quantityKwh} kWh · {order.settlementAsset}</strong><small>{order.id}</small></div>
              <dl>
                <div><dt>Delivered</dt><dd>{order.deliveredKwh??0} kWh</dd></div>
                <div><dt>Variance</dt><dd>{order.varianceKwh??0} kWh</dd></div>
                <div><dt>Total</dt><dd>{money(order.pricing.total,order.currency)}</dd></div>
                <div><dt>Settlement ref</dt><dd>{order.settlementReference??"—"}</dd></div>
              </dl>
            </div>
            <div className="local-energy-order-actions">
              {label&&<button type="button" disabled={Boolean(busy)} onClick={()=>void advance(order)}>{busy?.startsWith(order.id)?<Activity className="animate-pulse"/>:<ArrowRight/>}{label}</button>}
              {["review_required","reserved"].includes(order.status)&&<button type="button" className="danger" disabled={Boolean(busy)} onClick={()=>void send(order,{action:"CANCEL"})}>Cancel</button>}
              {["reserved","delivering","delivered","reconciled","settlement_ready"].includes(order.status)&&<button type="button" className="secondary" disabled={Boolean(busy)} onClick={()=>void send(order,{action:"DISPUTE"})}>Dispute</button>}
              {order.status==="settled"&&<span className="data-mode-chip live"><CheckCircle2/>Completed</span>}
              {order.status==="cancelled"&&<span className="data-mode-chip degraded">Cancelled</span>}
              {order.status==="disputed"&&<span className="data-mode-chip degraded"><CircleAlert/>Disputed</span>}
            </div>
          </article>;
        })}
        {!orders.length&&!loading&&<div className="rounded-xl border border-dashed p-8 text-center text-sm text-[var(--muted)]">No Local Energy orders yet.</div>}
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-3">
      <article className="dashboard-panel"><Scale className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">Physical authority</h2><p className="mt-2 text-sm text-[var(--muted)]">Meter evidence and reconciliation remain authoritative for delivery.</p></article>
      <article className="dashboard-panel"><LockKeyhole className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">Financial control</h2><p className="mt-2 text-sm text-[var(--muted)]">Settlement cannot be marked ready until evidence-backed delivery has been reconciled.</p></article>
      <article className="dashboard-panel"><WalletCards className="h-5 w-5 text-emerald-700"/><h2 className="mt-4 font-semibold">Wallet boundary</h2><p className="mt-2 text-sm text-[var(--muted)]">External wallet/payment references are recorded; Local Energy OS does not sign on the user's behalf.</p></article>
    </section>

    <Link href="/digital-energy/controls" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">Open Institutional Controls <ArrowRight className="h-4 w-4"/></Link>
  </div>;
}
