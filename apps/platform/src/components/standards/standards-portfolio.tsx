"use client";

import { useMemo, useState } from "react";
import { conformanceProfiles, governanceBodies, publicationLifecycle, standardsPublications } from "@/data/standards";

const classLabels: Record<string, string> = {
  "normative-standard": "Normative Standard",
  "reference-model": "Reference Model",
  "reference-architecture": "Reference Architecture",
  "engineering-guide": "Engineering Guide",
  "informative-report": "Informative Report",
  "governance-document": "Governance Document",
};

export function StandardsPortfolio() {
  const [query, setQuery] = useState("");
  const [portfolio, setPortfolio] = useState("all");
  const filtered = useMemo(() => standardsPublications.filter((item) => {
    const matchesQuery = `${item.id} ${item.title} ${item.summary}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (portfolio === "all" || item.portfolio === portfolio);
  }), [portfolio, query]);

  return <div className="space-y-7">
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["17", "Publications", "Stable identifiers across the portfolio"],
        ["6", "Conformance profiles", "Deployment-oriented certification targets"],
        ["5", "Governance bodies", "Published ownership and decision rights"],
        ["8", "Lifecycle stages", "Proposal through retirement"],
      ].map(([value, label, detail]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,.5)] dark:border-white/10 dark:bg-slate-950"><p className="text-3xl font-black tracking-[-.04em] text-slate-950 dark:text-white">{value}</p><p className="mt-1 text-sm font-extrabold text-slate-800 dark:text-slate-100">{label}</p><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{detail}</p></article>)}
    </section>

    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">PTSP 5.0 Draft</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Standards portfolio</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Normative standards, reference models, governance publications and conformance requirements with explicit ownership and compatibility boundaries.</p></div><div className="grid gap-2 sm:grid-cols-2"><input aria-label="Search publications" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search standards" className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none ring-emerald-600/20 focus:ring-4 dark:border-white/10 dark:bg-slate-900"/><select aria-label="Filter portfolio" value={portfolio} onChange={(event) => setPortfolio(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-900"><option value="all">All portfolios</option>{["foundation","core","domain","reference","engineering","governance","conformance"].map((value) => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}</select></div></div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">{filtered.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:hover:border-emerald-400/40"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">{item.id}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">{item.status.replaceAll("-", " ")}</span></div><h3 className="mt-3 text-base font-black text-slate-950 dark:text-white">{item.title}</h3><p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.summary}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">{classLabels[item.classification]}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{item.owner}</span></div></article>)}</div>
    </section>

    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950 sm:p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">Certification</p><h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Conformance profiles</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{conformanceProfiles.map((profile) => <div key={profile.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10"><h3 className="font-black text-slate-950 dark:text-white">{profile.title}</h3><p className="mt-1 text-xs text-slate-500">{profile.audience}</p><p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">{profile.requiredStandards.length} required standards</p></div>)}</div></article>
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-slate-950 sm:p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-700 dark:text-emerald-300">Governance</p><h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">Permanent ownership</h2><div className="mt-5 space-y-3">{governanceBodies.map((body) => <div key={body.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10"><h3 className="font-black text-slate-950 dark:text-white">{body.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{body.mandate}</p></div>)}</div></article>
    </section>

    <section className="rounded-[24px] bg-slate-950 p-5 text-white sm:p-6"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Publication lifecycle</p><div className="mt-5 grid gap-2 sm:grid-cols-4 xl:grid-cols-8">{publicationLifecycle.map((stage, index) => <div key={stage} className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] font-black text-emerald-300">{String(index + 1).padStart(2,"0")}</p><p className="mt-2 text-xs font-bold capitalize text-slate-100">{stage.replaceAll("-", " ")}</p></div>)}</div><p className="mt-5 text-sm leading-7 text-slate-300">Each transition requires documented review criteria, accountable approval, compatibility evidence and updated conformance assets.</p></section>
  </div>;
}
