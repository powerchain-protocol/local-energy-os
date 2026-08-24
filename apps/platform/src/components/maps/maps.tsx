"use client";

import { Crosshair2Icon, GlobeIcon, LightningBoltIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useMemo, useState } from "react";
import { useMaps } from "@/hooks/use-maps";
import type { MapAsset } from "@/maps/types";
import { ButtonLink } from "@/components/ui/button";

const kinds = ["all", "power-plant", "wind-farm", "solar-plant", "ev-charger", "smart-meter", "helium-hotspot"];

function point(asset: MapAsset) {
  return { x: ((asset.longitude + 180) / 360) * 100, y: ((90 - asset.latitude) / 180) * 100 };
}

function statusColor(status: MapAsset["status"]) {
  if (status === "online") return "bg-emerald-400";
  if (status === "degraded") return "bg-amber-400";
  if (status === "planned") return "bg-sky-400";
  return "bg-red-500";
}

export function SmartGridMap({ title = "Worldwide smart grid" }: { title?: string }) {
  const { query, setQuery, kind, setKind, assets, total } = useMaps();
  const [selectedId, setSelectedId] = useState<string | null>(assets[0]?.id ?? null);
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0];
  const stats = useMemo(() => ({
    online: assets.filter((asset) => asset.status === "online").length,
    capacity: assets.reduce((sum, asset) => sum + (asset.capacityMw ?? 0), 0),
    countries: new Set(assets.map((asset) => asset.country)).size,
  }), [assets]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Grid intelligence</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Operational visibility across renewable plants, EV infrastructure, smart meters and DePIN coverage.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
            <span className="sr-only">Search infrastructure</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plant, country, owner…" className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm shadow-sm outline-none transition focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-500/10 sm:w-72" />
          </label>
          <select value={kind} onChange={(event) => setKind(event.target.value)} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm shadow-sm">
            {kinds.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel px-4 py-3"><p className="text-xs font-semibold text-[var(--muted)]">Visible assets</p><p className="mt-1 text-2xl font-black">{total}</p></div>
        <div className="panel px-4 py-3"><p className="text-xs font-semibold text-[var(--muted)]">Online now</p><p className="mt-1 text-2xl font-black">{stats.online}</p></div>
        <div className="panel px-4 py-3"><p className="text-xs font-semibold text-[var(--muted)]">Tracked capacity</p><p className="mt-1 text-2xl font-black">{stats.capacity.toFixed(1)} MW</p></div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="relative min-h-[32rem] overflow-hidden rounded-3xl border border-emerald-950/20 bg-[#071b18] shadow-[0_24px_70px_rgba(3,24,20,.22)]">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(52,211,153,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,.13) 1px,transparent 1px)", backgroundSize: "8.33% 16.66%" }} />
          <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 1000 520" aria-hidden>
            <path fill="#34d399" d="M93 128l42-42 68-14 55 18 44 42-24 33-58 8-12 41-47 26-26-46-47-13zM303 86l83-32 73 17 38 51-25 47-66-5-34 29-59-19-17-50zM471 132l79-29 94 13 58 47-14 48-66 15-32 41-58-9-42-45zM707 92l100-19 89 33 36 57-35 40-73-17-36 28-54-35-39-45zM159 281l58-18 69 28 28 69-42 65-73-9-45-53zM419 275l93-17 86 41 9 72-54 56-84-6-42-51zM694 282l82-22 95 25 35 72-52 64-86-8-47-50z" />
          </svg>
          <div className="absolute left-5 top-5 z-10 flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
            <GlobeIcon /> {stats.countries} countries <span className="opacity-40">•</span> Live telemetry
          </div>
          <div className="absolute bottom-5 left-5 z-10 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-[11px] text-white backdrop-blur-md">
            {[['Online','bg-emerald-400'],['Degraded','bg-amber-400'],['Planned','bg-sky-400'],['Offline','bg-red-500']].map(([label,color])=><span key={label} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`}/>{label}</span>)}
          </div>
          {assets.map((asset) => {
            const p = point(asset);
            const active = selected?.id === asset.id;
            return (
              <button key={asset.id} onClick={() => setSelectedId(asset.id)} title={`${asset.name} — ${asset.status}`} className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <span className={`absolute -inset-2 rounded-full ${statusColor(asset.status)} opacity-20 ${asset.status === "online" ? "animate-ping" : ""}`} />
                <span className={`relative block rounded-full border-2 border-white shadow-[0_0_0_5px_rgba(255,255,255,.08),0_5px_18px_rgba(0,0,0,.4)] transition ${active ? "h-5 w-5" : "h-3.5 w-3.5"} ${statusColor(asset.status)}`} />
              </button>
            );
          })}
        </div>

        <aside className="space-y-4">
          {selected ? (
            <article className="panel overflow-hidden">
              <div className="bg-[linear-gradient(135deg,rgba(6,95,70,.12),rgba(16,185,129,.03))] p-5">
                <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Selected asset</p><h2 className="mt-2 text-xl font-extrabold">{selected.name}</h2><p className="mt-1 text-sm text-[var(--muted)]">{selected.region}, {selected.country}</p></div><span className="status-badge">{selected.status}</span></div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-[var(--muted)]">Asset type</p><p className="mt-1 font-bold capitalize">{selected.kind.replaceAll("-", " ")}</p></div><div><p className="text-xs text-[var(--muted)]">Network</p><p className="mt-1 font-bold">{selected.network}</p></div><div><p className="text-xs text-[var(--muted)]">Capacity</p><p className="mt-1 font-bold">{selected.capacityMw ? `${selected.capacityMw} MW` : "Edge node"}</p></div><div><p className="text-xs text-[var(--muted)]">Coordinates</p><p className="mt-1 font-bold">{selected.latitude.toFixed(2)}, {selected.longitude.toFixed(2)}</p></div></div>
              </div>
              <div className="border-t border-[var(--border)] p-4"><ButtonLink href={`/digital-twins/${selected.id}`} className="w-full"><Crosshair2Icon /> Open digital twin</ButtonLink></div>
            </article>
          ) : null}
          <div className="max-h-[18rem] space-y-2 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-sm">
            {assets.map((asset) => <button key={asset.id} onClick={() => setSelectedId(asset.id)} className={`w-full rounded-xl p-3 text-left transition ${selected?.id === asset.id ? "bg-emerald-500/10" : "hover:bg-black/[.035] dark:hover:bg-white/[.04]"}`}><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-bold">{asset.name}</span><span className={`h-2 w-2 shrink-0 rounded-full ${statusColor(asset.status)}`} /></div><div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]"><LightningBoltIcon />{asset.kind.replaceAll("-", " ")}{asset.capacityMw ? ` · ${asset.capacityMw} MW` : ""}</div></button>)}
            {!assets.length && <div className="p-8 text-center text-sm text-[var(--muted)]">No infrastructure matched this search.</div>}
          </div>
        </aside>
      </div>
    </section>
  );
}
