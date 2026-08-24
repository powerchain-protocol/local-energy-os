"use client";
import { useState } from "react";
import type { EnergyCommodity, OrderSide } from "@/energy/exchange";

export function OrderTicket() {
  const [side, setSide] = useState<OrderSide>("buy");
  const [status, setStatus] = useState<string>("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("Submitting order…");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/exchange/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ organizationId: "org_demo", side, commodity: data.get("commodity") as EnergyCommodity, quantity: Number(data.get("quantity")), limitPrice: Number(data.get("limitPrice")), currency: data.get("currency") }) });
    const body = await response.json(); setStatus(response.ok ? `Order ${body.order.id} created` : body.error ?? "Order failed");
  }
  return <form onSubmit={submit} className="pc-card space-y-4 p-5" aria-label="Energy exchange order ticket">
    <div><h2 className="text-lg font-bold">Order ticket</h2><p className="text-sm text-slate-500">Trade tokenized energy, RECs, and carbon credits.</p></div>
    <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
      {(["buy","sell"] as const).map((value)=><button type="button" key={value} onClick={()=>setSide(value)} aria-pressed={side===value} className={`pc-focus rounded-lg px-3 py-2 text-sm font-semibold capitalize ${side===value ? "bg-white shadow-sm dark:bg-slate-800" : "text-slate-500"}`}>{value}</button>)}
    </div>
    <label className="block text-sm font-medium">Market<select name="commodity" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2"><option value="SOLAR_MWH">Solar MWh</option><option value="WIND_MWH">Wind MWh</option><option value="REC">REC</option><option value="CRT">CRT</option></select></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Quantity<input required min="0.01" step="0.01" name="quantity" type="number" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2" /></label><label className="text-sm font-medium">Limit price<input required min="0.01" step="0.01" name="limitPrice" type="number" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2" /></label></div>
    <label className="block text-sm font-medium">Settlement<select name="currency" className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2"><option>USDC</option><option>USD</option><option>PWRC</option></select></label>
    <button type="submit" className="pc-focus w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white hover:bg-emerald-700">Review {side} order</button>
    <p role="status" aria-live="polite" className="min-h-5 text-sm text-slate-500">{status}</p>
  </form>;
}
