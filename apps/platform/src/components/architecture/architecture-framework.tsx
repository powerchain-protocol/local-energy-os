"use client";

import { useMemo, useState } from "react";
import { architectureLayers, standardsCatalog } from "@/data/architecture";

export function ArchitectureFramework() {
  const [query, setQuery] = useState("");
  const standards = useMemo(() => standardsCatalog.filter((item) => `${item.id} ${item.title}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="space-y-7">
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {architectureLayers.map((layer, index) => (
          <article key={layer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_45px_-34px_rgba(15,23,42,.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_-34px_rgba(15,90,70,.5)] dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Layer {index + 1}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{layer.owner}</span></div>
            <h2 className="mt-4 text-lg font-black tracking-tight text-slate-950 dark:text-white">{layer.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{layer.concern}</p>
            <div className="mt-4 rounded-xl border border-emerald-900/10 bg-emerald-50 p-3 dark:border-emerald-300/10 dark:bg-emerald-400/10"><p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-100">{layer.contract}</p></div>
            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">{layer.outputs.map((output) => <li key={output}>• {output}</li>)}</ul>
          </article>
        ))}
      </section>
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Normative catalog</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">PowerChain standards</h2></div><input aria-label="Search standards" className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-600/20 focus:ring-4 dark:border-white/10 dark:bg-slate-900 sm:max-w-xs" onChange={(event) => setQuery(event.target.value)} placeholder="Search PPA standards" value={query} /></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{standards.map((item) => <article className="rounded-xl border border-slate-200 p-4 dark:border-white/10" key={item.id}><div className="flex items-center justify-between"><span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">{item.id}</span><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.status}</span></div><h3 className="mt-2 font-bold text-slate-950 dark:text-white">{item.title}</h3><p className="mt-1 text-xs capitalize text-slate-500">{item.layer} architecture</p></article>)}</div>
      </section>
      <section className="grid gap-4 lg:grid-cols-3"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-300">Traceability</p><p className="mt-3 text-sm leading-7 text-slate-300">Principle → Requirement → Capability → Model → Protocol → Schema → Implementation → Conformance Test</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Critical invariant</p><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">One verified unit of renewable electricity can be issued, transferred, settled and retired exactly once.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950"><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700 dark:text-emerald-300">Release evidence</p><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Standards, schemas, compatibility report, migration guidance, conformance suites and security advisories.</p></div></section>
    </div>
  );
}
