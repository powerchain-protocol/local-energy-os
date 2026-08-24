"use client";
import { Shell } from "@/components/shell";
import { MarketTable } from "@/components/exchange/market-table";
import { OrderTicket } from "@/components/exchange/order-ticket";
import { listMarketQuotes } from "@/energy/exchange";

export default function EnergyExchangePage() {
  return <Shell><main className="pc-page"><div className="pc-container space-y-6">
    <header><p className="text-sm font-semibold text-emerald-700">Energy markets</p><h1 className="text-3xl font-extrabold tracking-tight">PowerChain Exchange</h1><p className="mt-2 max-w-3xl text-slate-500">Institutional market access for tokenized renewable generation, renewable energy certificates, and verified carbon credits.</p></header>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><MarketTable quotes={listMarketQuotes()} /><OrderTicket /></div>
  </div></main></Shell>;
}
