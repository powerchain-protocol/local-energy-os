"use client";
import { Bell, Menu, Moon, Search, Sparkles, Sun } from "lucide-react";
import Link from "next/link";
import { GlobalSearch } from "./search";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { useApp } from "@/context/app-context";
import { usePageMeta } from "@/hooks/use-page-meta";
import { usePreferences } from "@/context/preferences-context";
import { WalletButton } from "./wallet/wallet-button";
import { Avatar } from "./avatar";
export function Header(){
 const {theme,toggle}=useTheme(); const {session}=useAuth(); const {setMobileSidebarOpen,setCommandOpen,setCopilotOpen}=useApp(); const meta=usePageMeta(); const {currency,setCurrency,distanceUnit,setDistanceUnit}=usePreferences();
 return <header className="app-header">
  <button onClick={()=>setMobileSidebarOpen(true)} aria-label="Open navigation" className="icon-button lg:hidden"><Menu className="h-5 w-5"/></button>
  <div className="min-w-0 leading-tight"><div className="flex min-w-0 items-center gap-2"><span className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-700 sm:inline dark:text-emerald-400">{meta.eyebrow}</span><span className="hidden h-1 w-1 rounded-full bg-[var(--border)] sm:inline"/><span className="truncate text-sm font-semibold sm:text-base">{meta.title}</span></div><p className="mt-0.5 hidden truncate text-[11px] text-[var(--muted)] md:block">{session?.user.organizationName??"Personal workspace"} · <span className="capitalize">{(session?.user.role??"consumer").replaceAll("-"," ")}</span></p></div>
  <div className="mx-4 hidden min-w-0 max-w-2xl flex-1 md:block xl:mx-8"><GlobalSearch/></div>
  <div className="ml-auto flex items-center gap-1.5">
   <button onClick={()=>setCommandOpen(true)} className="icon-button md:hidden" aria-label="Search"><Search className="h-5 w-5"/></button>
   <select aria-label="Currency" value={currency} onChange={e=>setCurrency(e.target.value as "USD"|"EUR")} className="header-select hidden sm:block"><option>USD</option><option>EUR</option></select>
   <select aria-label="Distance unit" value={distanceUnit} onChange={e=>setDistanceUnit(e.target.value as "km"|"mi")} className="header-select hidden lg:block"><option value="km">km</option><option value="mi">mi</option></select>
   <button type="button" onClick={()=>setCopilotOpen(true)} className="copilot-header-button" aria-label="Open PowerChain Copilot"><Sparkles className="h-4 w-4"/><span>Copilot</span></button>
   <Link href="/notifications" className="icon-button relative" aria-label="Notifications"><Bell className="h-5 w-5"/><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--surface)] bg-amber-500"/></Link>
   <button onClick={toggle} className="icon-button" aria-label="Toggle theme">{theme==="white"||theme==="framed"?<Moon className="h-5 w-5"/>:<Sun className="h-5 w-5"/>}</button>
   <WalletButton/>
   <Link href="/settings" aria-label="Open profile" className="rounded-full transition hover:-translate-y-px"><Avatar name={session?.user.name??"PowerChain User"} coin/></Link>
  </div>
 </header>
}
