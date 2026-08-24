"use client";
import { ArrowUpRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { useAccess } from "@/context/access-context";
import { useApp } from "@/context/app-context";
import { roleDashboards } from "@/data/role-dashboards";
import { DashboardHero } from "./dashboard-hero";
import { DashboardMap } from "./dashboard-map";
import { DigitalEnergyCommandCenter } from "@/components/digital-energy";

export function DashboardPage(){
 const {role,can}=useAccess();
 const {setCopilotOpen}=useApp();
 const dashboard=roleDashboards[role]??roleDashboards.consumer;
 const quickActions=dashboard.quickActions??[dashboard.primaryAction].filter((value): value is string=>Boolean(value));
 return <Shell><div className="dashboard-page">
  <DashboardHero roleLabel={role.replace("-"," ")} title={dashboard.title} subtitle={dashboard.subtitle} quickActions={quickActions} canTrade={can("marketplace:trade")}/>
  <DigitalEnergyCommandCenter/>
  <section className="dashboard-main-grid"><DashboardMap/><aside className="dashboard-side-stack"><article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">Execution boundary</span><h2>Review-first operations</h2></div><ShieldCheck className="h-5 w-5 text-emerald-700"/></div><p className="ai-priority">Energy RWA, delivery, reconciliation, settlement and network writes require current backing or meter evidence, explicit authorization and idempotent execution.</p><div className="flex flex-wrap gap-3"><Link className="text-link" href="/energy-rwa">Energy RWA <ArrowUpRight/></Link><Link className="text-link" href="/energy-operations">Energy Operations <ArrowUpRight/></Link></div></article><article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">PowerChain Copilot</span><h2>Renewable RWA operating intelligence</h2></div><Sparkles className="h-5 w-5 text-emerald-700"/></div><p className="ai-priority">Ask naturally. The RWA Orchestrator coordinates specialist agents and reusable skills. High-impact actions become reviewable drafts; agents never sign wallet transactions.</p><div className="flex flex-wrap gap-3"><button type="button" className="text-link" onClick={()=>setCopilotOpen(true)}>Open Copilot <ArrowUpRight/></button><Link className="text-link" href="/copilot/action-center">Action Center <ArrowUpRight/></Link></div></article></aside></section>
 </div></Shell>
}
