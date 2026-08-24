"use client";
import { Activity, BatteryCharging, Leaf, Zap } from "lucide-react";
const items = [
  { label: "Energy produced", value: "18.64 GWh", change: "+12.8%", icon: Zap },
  { label: "Grid availability", value: "99.82%", change: "+0.21%", icon: Activity },
  { label: "Carbon avoided", value: "12,456 tCO₂e", change: "+14.6%", icon: Leaf },
  { label: "Storage dispatched", value: "62.4 MWh", change: "+7.4%", icon: BatteryCharging },
];
export function AnalyticsKpis() { return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(({label,value,change,icon:Icon}) => <article key={label} className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-950"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="h-5 w-5 text-emerald-700" /></div><p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-2 text-xs font-medium text-emerald-700">{change} vs prior period</p></article>)}</div> }
