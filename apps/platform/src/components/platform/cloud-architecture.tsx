"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircledIcon, ClockIcon, MagnifyingGlassIcon, RocketIcon } from "@radix-ui/react-icons";
import { PLATFORM_LAYERS, summarizePlatformCatalog } from "@/data/platform";
import type { PlatformCapabilityStatus, PlatformLayerId } from "@/types/platform";

const statusStyles: Record<PlatformCapabilityStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-800",
  preview: "border-amber-200 bg-amber-50 text-amber-800",
  planned: "border-slate-200 bg-slate-50 text-slate-600",
};

export function CloudArchitecture() {
  const summary = summarizePlatformCatalog();
  const [query, setQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState<PlatformLayerId | "all">("all");
  const filteredLayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return PLATFORM_LAYERS
      .filter((layer) => activeLayer === "all" || layer.id === activeLayer)
      .map((layer) => ({
        ...layer,
        capabilities: layer.capabilities.filter((capability) =>
          !normalized || [capability.name, capability.description, ...capability.services].join(" ").toLowerCase().includes(normalized),
        ),
      }))
      .filter((layer) => layer.capabilities.length > 0);
  }, [activeLayer, query]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Platform layers", summary.layers],
          ["Capabilities", summary.capabilities],
          ["Available", summary.available],
          ["Preview", summary.preview],
          ["Roadmap", summary.planned],
        ].map(([label, value]) => (
          <article className="surface-card p-4" key={label}>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="surface-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search platform capabilities</span>
            <input className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 dark:border-white/10 dark:bg-white/5" onChange={(event) => setQuery(event.target.value)} placeholder="Search clouds, runtimes, fabrics or services" value={query} />
          </label>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            <button className={`rounded-full border px-3 py-2 text-xs font-semibold ${activeLayer === "all" ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`} onClick={() => setActiveLayer("all")}>All</button>
            {PLATFORM_LAYERS.map((layer) => (
              <button className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold ${activeLayer === layer.id ? "border-emerald-700 bg-emerald-800 text-white" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`} key={layer.id} onClick={() => setActiveLayer(layer.id)}>{layer.name}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-8">
        {filteredLayers.map((layer, layerIndex) => (
          <section key={layer.id}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">{String(layerIndex + 1).padStart(2, "0")} · {layer.eyebrow}</p>
                <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">{layer.name}</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-300">{layer.description}</p>
              </div>
              <span className="hidden rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 sm:block dark:border-white/10">{layer.capabilities.length} capabilities</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {layer.capabilities.map((capability) => {
                const body = (
                  <article className="surface-card group h-full p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(15,90,70,.35)]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-900 text-white shadow-sm">
                        {capability.status === "available" ? <CheckCircledIcon /> : capability.status === "preview" ? <RocketIcon /> : <ClockIcon />}
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[capability.status]}`}>{capability.status}</span>
                    </div>
                    <h3 className="mt-4 text-base font-extrabold tracking-tight">{capability.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{capability.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {capability.services.map((service) => <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300" key={service}>{service}</span>)}
                    </div>
                    {capability.href && <p className="mt-5 text-xs font-bold text-emerald-700 transition group-hover:translate-x-1">Open workspace →</p>}
                  </article>
                );
                return capability.href ? <Link href={capability.href} key={capability.id}>{body}</Link> : <div key={capability.id}>{body}</div>;
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
